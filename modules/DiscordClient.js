import discord, { Collection } from "discord.js";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { EOL } from "os";
import { join } from "path";
import { inspect } from "util";
import { MCUser } from "./db.js";
import logger from "./logger.js";
import { loadCommands, loadEvents, permissions } from "./utils.js";

/**
 * @typedef WhitelistEntry
 * @property {string} uuid
 * @property {string} name
 */


/**
 * @param  {import("discord.js").DiscordAPIError} e
 */
function handleChannelFetchError(e) {
    logger.error(`Received an error fetching the log channel: ${e.name} - ${e.message}`);
}

class Client extends discord.Client {
    /**
     * @param  {import("../typings/config")["blizzbot"]["discord"]} config
     */
    constructor(config) {
        super({
            intents: [
                discord.Intents.FLAGS.GUILD_MESSAGES,
                discord.Intents.FLAGS.GUILDS,
                discord.Intents.FLAGS.GUILD_MEMBERS,
                discord.Intents.FLAGS.DIRECT_MESSAGES,
                discord.Intents.FLAGS.GUILD_VOICE_STATES,
                discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ],
            partials: [
                "MESSAGE",
                "CHANNEL",
                "GUILD_MEMBER",
                "USER",
            ],
        });
        /** @type {import("../typings/config")["blizzbot"]["discord"]}*/
        this.config = config;
        this.commands = new Collection;
        this.slashCommands = new Collection;
        this.contextCommands = new Collection;
        this.linkUsage = {};
        this.on("ready", () => { logger.info("The bot just started."); });
        loadCommands("commands/slash/user", this.slashCommands);
        loadCommands("commands/slash/moderation", this.slashCommands);
        loadCommands("commands/slash/dev", this.slashCommands);
        loadEvents(this, "events");
        if (process.env.DEBUG === "2") this.on("debug", m => { logger.debug(m); });
        this.on("warn", m => { logger.warn(m); });
        this.on("error", m => { logger.error(m); });
        this.once("ready", async () => {
            const verificationChannel = await this.channels.fetch(config.channels.verificate, { cache: true }).catch(handleChannelFetchError);
            if (!verificationChannel || !verificationChannel.isText()) {
                logger.warn("The verificate channel supplied in the config file is not a text channel.");
                return;
            }
            await verificationChannel.messages.fetch(config.verificationMessage);
            this.logChannel = await this.channels.fetch(config.channels.log, { cache: true }).catch(handleChannelFetchError);
            if (!this.logChannel || !this.logChannel.isText()) {
                logger.warn("The log channel supplied in the config file is not a text channel.");
                return;
            }
            this.anfrageChannel = await this.channels.fetch(config.channels.anfrage, { cache: true }).catch(handleChannelFetchError);
            if (!this.anfrageChannel || !this.anfrageChannel.isText()) {
                logger.warn("The Anfrage channel supplied in the config file is not a text channel.");
                return;
            }
            this.standardChannel = await this.channels.fetch(config.channels.standard, { cache: true }).catch(handleChannelFetchError);
            if (!this.standardChannel || !this.standardChannel.isText()) {
                logger.warn("The 'standard' channel supplied in the config file is not a text channel.");
                return;
            }
            const slashGuild = await this.guilds.fetch(this.config.slashGuild).catch(() => {
                logger.warn("received an error while trying to fetch the slashGuild.");
            });
            if (!slashGuild) return;
            const slashSetup = this.slashCommands.map((cmd, name) => {
                logger.silly(`Parsing Command ${name}`);
                logger.silly(`Command setup is ${inspect(cmd.setup)}`);
                return cmd.setup;
            });
            this.contextCommands.forEach((cmd) => slashSetup.push(cmd.toJson()));
            const slashCommands = await slashGuild.commands.set(slashSetup);
            const fullPermissions = new Array;
            slashCommands.filter((cmd) => this.slashCommands.get(cmd.name).perm === permissions.mod).forEach((cmd, id) => {
                /** @type {import("discord.js").GuildApplicationCommandPermissionData} */
                const perm = {
                    id,
                    permissions: [{
                        id: config.roles.mod,
                        permission: true,
                        type: "ROLE",
                    }],
                };
                fullPermissions.push(perm);
            });
            logger.silly(`slash perms are ${inspect(fullPermissions)}`);
            slashGuild.commands.permissions.set({
                fullPermissions,
            });
        });
        this.blacklist = readFileSync("configs/badwords.txt", "utf-8").split(EOL).filter((word) => word !== "");
        this.welcomeTexts = readFileSync("configs/welcome.txt", "utf-8").split(EOL).filter((word) => word !== "");
        /** @type {import("./ptero").Ptero}*/
        this.ptero = undefined;
    }
    async syncWhitelist() {
        const mcusers = await MCUser.findAll();
        /** @type {WhitelistEntry[]} */
        const twitch = [];
        /** @type {WhitelistEntry[]} */
        const youtube = [];
        mcusers.forEach((mcUser) => {
            if (mcUser.get("whitelistTwitch")) {
                twitch.push({
                    uuid: mcUser.mcId,
                    name: mcUser.mcName,
                });
            }
            if (mcUser.get("whitelistYouTube")) {
                youtube.push({
                    uuid: mcUser.mcId,
                    name: mcUser.mcName,
                });
            }
        });
        const ytlist = JSON.stringify(youtube, undefined, 2);
        const twlist = JSON.stringify(twitch, undefined, 2);

        // create whitelistfolder and txt files
        if (!existsSync("whitelist")) mkdirSync("whitelist");
        if (!existsSync("whitelist/twitch")) mkdirSync("whitelist/twitch");
        if (!existsSync("whitelist/youtube")) mkdirSync("whitelist/youtube");
        ["paths", "pterodactyl"].forEach((txtFile) => appendFileSync(`whitelist/youtube/${txtFile}.txt`, ""));
        ["paths", "pterodactyl"].forEach((txtFile) => appendFileSync(`whitelist/twitch/${txtFile}.txt`, ""));

        writeFileSync("whitelist/youtube/whitelist.json", ytlist);
        writeFileSync("whitelist/twitch/whitelist.json", twlist);
        const ytPaths = readFileSync("whitelist/youtube/paths.txt", "utf8").split(EOL).filter((path) => path !== "").map((path) => join(path, "whitelist.json"));
        const twPaths = readFileSync("whitelist/twitch/paths.txt", "utf8").split(EOL).filter((path) => path !== "").map((path) => join(path, "whitelist.json"));
        for (const path of ytPaths) copyFileSync("whitelist/youtube/whitelist.json", path);
        for (const path of twPaths) copyFileSync("whitelist/twitch/whitelist.json", path);
        const pteroYtFile = readFileSync("whitelist/youtube/pterodactyl.txt", "utf8").split(EOL).filter((path) => path !== "");
        const pteroTwFile = readFileSync("whitelist/twitch/pterodactyl.txt", "utf8").split(EOL).filter((path) => path !== "");
        for (const srv of pteroYtFile) {
            const [serverid, whitelistpath] = srv.split(" ");
            if (!serverid || !whitelistpath) return;
            this.ptero.writeFile(serverid, whitelistpath, ytlist);
        }
        for (const srv of pteroTwFile) {
            const [serverid, whitelistpath] = srv.split(" ");
            if (!serverid || !whitelistpath) return;
            this.ptero.writeFile(serverid, whitelistpath, twlist);
        }
    }
}

export default Client;
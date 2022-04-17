import discord, { Collection } from "discord.js";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { EOL } from "os";
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
        loadCommands("commands/text", this.commands);
        loadCommands("commands/text/commands", this.commands);
        loadCommands("commands/text/functions", this.commands);
        loadCommands("commands/text/ccmds", this.commands);
        loadCommands("commands/slash", this.slashCommands);
        loadEvents(this, "events");
        if (process.env.DEBUG === "2") this.on("debug", m => { logger.debug(m); });
        this.on("warn", m => { logger.warn(m); });
        this.on("error", m => { logger.error(m); });
        this.once("ready", async () => {
            this.logChannel = await this.channels.fetch(config.channels.log, { cache: true }).catch(handleChannelFetchError);
            if (!this.logChannel) return;
            if (!this.logChannel.isText()) logger.warn("The log channel supplied in the config file is not a text channel.");
            this.anfrageChannel = await this.channels.fetch(config.channels.anfrage, { cache: true }).catch(handleChannelFetchError);
            if (!this.anfrageChannel) return logger.warn("The 'anfrage' channel supplied in the config file is not a known channel.");
            if (!this.anfrageChannel.isText()) return logger.warn("The Anfrage channel supplied in the config file is not a text channel.");
            this.standardChannel = await this.channels.fetch(config.channels.standard, { cache: true }).catch(handleChannelFetchError);
            if (!this.standardChannel) return logger.warn("The 'standard' channel supplied in the config file is not a known channel.");
            if (!this.standardChannel.isText()) return logger.warn("The 'standard' channel supplied in the config file is not a text channel.");
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
        this.blacklist = readFileSync("badwords.txt", "utf-8").split(EOL).filter((word) => word !== "");
        this.welcomeTexts = readFileSync("welcome.txt", "utf-8").split(EOL).filter((word) => word !== "");
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
        if (!existsSync("whitelist")) mkdirSync("whitelist");
        if (!existsSync("whitelist/twitch")) mkdirSync("whitelist/twitch");
        if (!existsSync("whitelist/youtube")) mkdirSync("whitelist/youtube");
        writeFileSync("whitelist/youtube/whitelist.json", ytlist);
        writeFileSync("whitelist/twitch/whitelist.json", twlist);
        const ytPaths = readFileSync("whitelist/youtube/paths.txt", "utf8").split(EOL);
        const twPaths = readFileSync("whitelist/twitch/paths.txt", "utf8").split(EOL);
        for (const path of ytPaths) copyFileSync("whitelist/youtube/whitelist.json", path);
        for (const path of twPaths) copyFileSync("whitelist/twitch/whitelist.json", path);
        const pteroYtFile = readFileSync("whitelist/youtube/pterodactyl.txt", "utf8").split(EOL);
        const pteroTwFile = readFileSync("whitelist/twitch/pterodactyl.txt", "utf8").split(EOL);
        for (const srv in pteroYtFile) {
            const [serverid, whitelistpath] = srv.split(" ");
            if (!serverid || !whitelistpath) return;
            // this.ptero.writeFile(serverid, whitelistpath, ytlist);
        }
        for (const srv in pteroTwFile) {
            const [serverid, whitelistpath] = srv.split(" ");
            if (!serverid || !whitelistpath) return;
            // this.ptero.writeFile(serverid, whitelistpath, twlist);
        }
    }
}

export default Client;
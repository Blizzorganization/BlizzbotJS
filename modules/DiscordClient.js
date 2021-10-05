import discord, { Collection } from "discord.js";
import { loadCommands, loadEvents } from "./utils.js";
import logger from "./logger.js";
import { readFileSync } from "fs";
import { EOL } from "os";
/**
 * @param  {import("discord.js").DiscordAPIError} e
 */
function handleChannelFetchError(e) {
    logger.error(`Received an error fetching the log channel: ${e.name} - ${e.message}`);
}

class Client extends discord.Client {
    /**
     * @param  {import("../config.json").discord} config
     */
    constructor(config) {
        super({
            intents: [
                discord.Intents.FLAGS.GUILD_MESSAGES,
                discord.Intents.FLAGS.GUILDS,
                discord.Intents.FLAGS.GUILD_MEMBERS,
            ],
            partials: [
                "MESSAGE",
                "CHANNEL",
                "GUILD_MEMBER",
                "USER",
            ],
        });
        this.config = config;
        this.commands = new Collection;
        this.on("ready", () => logger.info("The bot just started."));
        loadCommands("commands/text", this.commands);
        loadEvents(this, "events");
        this.on("debug", m => logger.debug(m));
        this.on("warn", m => logger.warn(m));
        this.on("error", m => logger.error(m));
        this.once("ready", async () => {
            this.logChannel = await this.channels.fetch(config.channels.log, { cache: true }).catch(handleChannelFetchError);
            if (!this.logChannel) return;
            if (!this.logChannel.isText()) logger.warn("The log channel supplied in the config file is not a text channel.");
        });
        this.blacklist = readFileSync("badwords.txt", "utf-8").split(EOL).filter((word) => word !== "");
    }
}

export default Client;
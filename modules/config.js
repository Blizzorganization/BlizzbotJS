import { existsSync, readFileSync, writeFileSync } from "fs";
import logger from "./logger.js";

const defaultConfig = {
    discord: {
        token: "The Bot token. Get one from https://discord.com/developers/applications",
        prefix: "!",
        slashGuild: "1234",
        channels: {
            log: "1234",
            commands: [
                "1234",
                "5678",
            ],
            clips: "1234",
            standard: "1234",
            adminCommands: ["1234", "5678"],
            anfrage: "1234",
            verificate: "1234",
            voiceCategory: "1234",
            textVoiceCategory: "1234",
        },
        roles: {
            whitelist: {
                youtube: ["1234", "5678"],
                twitch: ["1234", "5678"],
            },
            noFilter: ["1234", "5678"],
            verify: "1234",
            dev: "1234",
            mod: "1234",
        },
        emojis: {
            left: "1234",
            right: "5678",
            randomReaction: "<:name:id>",
        },
    },
    database: {
        host: "localhost",
        port: 5432,
        user: "blizzbot",
        database: "blizzbot",
        password: "secret_database_password",
        type: "postgres",
    },
    pterodactyl: {
        host: "",
        apiKey: "",
    },
};

if (!existsSync("config.json")) {
    logger.error("There is no configuration file.");
    writeFileSync("config.json", JSON.stringify(defaultConfig, undefined, 4));
    logger.info("Created a configuration file - please fill.");
    process.exit(1);
}
const config = JSON.parse(readFileSync("config.json", "utf8"));

/** @type {import("../typings/config")["blizzbot"]["discord"]}*/
const discord = {
    token: config.discord.token || (() => {
        logger.error("No token supplied. Get one from https://discord.com/developers/applications");
        process.exit(1);
    })(),
    slashGuild: config.discord.slashGuild || "1234",
    prefix: config.discord.prefix || "!",
    channels: {
        log: config.discord.channels.log || "1234",
        clips: config.discord.channels.clips || "1234",
        commands: config.discord.channels.commands || [],
        adminCommands: config.discord.channels.adminCommands || [],
        anfrage: config.discord.channels.anfrage || "1234",
        verificate: config.discord.channels.verificate || "1234",
        standard: config.discord.channels.standard || "1234",
        voiceCategory: config.discord.channels.voiceCategory || "1234",
        textVoiceCategory: config.discord.channels.textVoiceCategory || "1234",
    },
    roles: {
        whitelist: {
            youtube: config.discord.roles.whitelist.youtube || [],
            twitch:  config.discord.roles.whitelist.twitch || [],
        },
        noFilter: config.discord.roles.noFilter || [],
        verify: config.discord.roles.verify || "1234",
        dev: config.discord.roles.dev || "1234",
        mod: config.discord.roles.mod || "1234",
    },
    emojis: {
        left: config.discord.emojis.left || "1234",
        right: config.discord.emojis.right || "5678",
        randomReaction: config.discord.emojis.ranodmReaction || "<:ZZBlizzor:493814042780237824>",
    },
};
/** @type {import("../typings/config")["blizzbot"]["database"]}*/
const database = {
    host: config.database.host || "localhost",
    port: config.database.port || 5432,
    user: config.database.user || "blizzbot",
    database: config.database.database || "blizzbot",
    password: config.database.password || "",
    type: ["mysql", "postgres"].includes(config.database.type) ? config.database.type : "postgres",
};
/** @type {import("../typings/config")["blizzbot"]["pterodactyl"]}*/
const pterodactyl = {
    host: config.pterodactyl.host || "",
    apiKey: config.pterodactyl.apiKey || "",
};

export {
    discord,
    database,
    pterodactyl,
};

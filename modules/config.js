import { existsSync, readFileSync, writeFileSync } from "fs";
import logger from "./logger";

const defaultConfig = {
    discord: {
        token: config.discord.token || (() => {
            logger.error("No token supplied. Get one from https://discord.com/developers/applications");
            process.exit(1);
        })(),
        prefix: "!",
        channels: {
            log: "1234",
            commands: [
                "1234",
                "5678",
            ],
            standard: "1234",
            adminCommands: "1234",
            anfrage: "1234",
        },
        roles: {
            whitelist: {
                youtube: ["1234", "5678"],
                twitch: ["1234", "5678"],
            },
            noFilter: ["1234", "5678"],
        },
        emojis: {
            left: "1234",
            right: "5678",
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
    logger.error("Es existiert keine Konfigurationsdatei.");
    writeFileSync("config.json", JSON.stringify(defaultConfig, undefined, 2));
    logger.info("Konfigurationsdatei erstellt, bitte ausfüllen.");
    process.exit(1);
}
const config = JSON.parse(readFileSync("config.json", "utf8"));

const discord = {
    token: config.discord.token,
    prefix: config.discord.prefix || "!",
    channels: {
        log: config.discord.channels.log,
        commands: config.discord.channels.commands || [],
        adminCommands: "1234",
        anfrage: "1234",
    },
    roles: {
        whitelist: {
            youtube: config.discord.roles.whitelist.youtube || [],
            twitch:  config.discord.roles.whitelist.twitch || [],
        },
        noFilter: config.discord.roles.noFilter || [],
    },
    emojis: {
        left: config.discord.emojis.left || "1234",
        right: config.discord.emojis.right || "5678",
    },
};
const database = {
    host: "localhost",
    port: config.database.port || 5432,
    user: config.database.user || "blizzbot",
    database: config.database.database || "blizzbot",
    password: config.database.password || "",
    type: ["mysql", "postgres"].includes(config.database.type) ? config.database.type : "postgres",
};
const pterodactyl = {
    host: "",
    apiKey: "",
};

export {
    discord,
    database,
    pterodactyl,
};

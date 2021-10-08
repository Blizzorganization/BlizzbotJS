import * as db from "./modules/db.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Client from "./modules/DiscordClient.js";
import logger from "./modules/logger.js";
import repl from "repl";
import { Ptero } from "./modules/ptero.js";

let configFile;
try {
    configFile = readFileSync("config.json", "utf-8");
} catch (e) {
    switch (e.code) {
        case "ENOENT":
            logger.error("There is no config.json");
            break;
        default:
            logger.error("There was an error reading the config file...\n" + e.stack);
    }
    process.exit(1);
}

if (!existsSync("badwords.txt")) writeFileSync("badwords.txt", "", { encoding: "utf-8" });
let config;
try {
    config = JSON.parse(configFile);
} catch (e) {
    logger.error("the config.json file does not contain correct json");
}

const client = new Client(config.discord);
db.init(config.database);
client.ptero = new Ptero(config.pterodactyl);
client.login(config.discord.token);

process.on("SIGINT", async () => {
    logger.info("Shutting down, please wait.");
    const stopping = [];
    stopping.push(client.destroy());
    stopping.push(db.db.close());
    await Promise.all(stopping);
    logger.info("Goodbye");
    logger.close();
    process.exit(0);
});
const r = repl.start("> ");
r.context.client = client;
r.context.db = db;
r.context.logger = logger;
r.context.stop = async function stop() {
    logger.info("Shutting down, please wait.");
    const stopping = [];
    stopping.push(client.destroy());
    stopping.push(db.db.close());
    await Promise.all(stopping);
    logger.info("Goodbye");
    logger.close();
    process.exit(0);
};
r.on("close", async () => {
    logger.info("Shutting down, please wait.");
    const stopping = [];
    stopping.push(client.destroy());
    stopping.push(db.db.close());
    await Promise.all(stopping);
    logger.info("Goodbye");
    logger.close();
    process.exit(0);
});
import { copyFileSync, existsSync, writeFileSync } from "fs";
import repl from "repl";
import { database, discord, pterodactyl } from "./modules/config.js";
import * as db from "./modules/db.js";
import Client from "./modules/DiscordClient.js";
import logger from "./modules/logger.js";
import { Ptero } from "./modules/ptero.js";

logger.silly("ensuring the existence of a badwords.txt file");
if (!existsSync("badwords.txt")) writeFileSync("badwords.txt", "", { encoding: "utf-8" });

logger.silly("ensuring the existence of a welcome.txt file");
if (!existsSync("welcome.txt")) copyFileSync("welcome.default.txt", "welcome.txt");

logger.silly("creating the discord client");
const client = new Client(discord);
logger.silly("initializing the database");
db.init(database);
logger.silly("creating the pterodactyl client");
client.ptero = new Ptero(pterodactyl);
logger.info("Discord Client logging in.");
client.login(discord.token);
async function stop() {
    logger.info("Shutting down, please wait.");
    const stopping = [];
    stopping.push(client.destroy());
    stopping.push(db.db.close());
    await Promise.all(stopping);
    logger.info("Goodbye");
    logger.close();
    process.exit(0);
}
const r = repl.start("> ");
process.on("SIGINT", async () => {
    await stop();
});
r.context.client = client;
r.context.db = db;
r.context.logger = logger;
r.context.stop = stop;
r.on("close", () => {
    stop();
});
r.defineCommand("stop", {
    action: stop,
    help: "Stop the bot",
});
export const context = r.context;
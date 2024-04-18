import { copyFileSync, existsSync, writeFileSync } from "fs";
import repl from "repl";
import { discord } from "./modules/config.js";
import * as db from "./modules/db.js";
import DiscordClient from "./modules/DiscordClient.js";
import logger from "./modules/logger.js";
import "./modules/ptero.js";

logger.silly("ensuring the existence of a badwords.txt file");
if (!existsSync("configs/badwords.txt"))
  writeFileSync("configs/badwords.txt", "", { encoding: "utf-8" });

logger.silly("ensuring the existence of a welcome.txt file");
if (!existsSync("configs/welcome.txt"))
  copyFileSync("configs/welcome.default.txt", "configs/welcome.txt");

logger.silly("creating the discord client");
const client = new DiscordClient();
logger.silly("initializing the database");
await db.sql`SELECT 1+1;`;
logger.silly("creating the pterodactyl client");
logger.info("Discord Client logging in.");
client.login(discord.token);
const r = repl.start("> ");
async function stop() {
  logger.info("Shutting down, please wait.");
  const stopping: Promise<unknown>[] = [];
  stopping.push(client.destroy());
  stopping.push(db.sql.end({ timeout: 5 }));
  await Promise.allSettled(stopping);
  logger.info("Goodbye");
  logger.close();
  process.exit(0);
}
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

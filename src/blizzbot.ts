import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import DiscordClient from "./modules/DiscordClient";
import config from "./modules/config";
import * as db from "./modules/db";
import logger from "./modules/logger";

logger.silly("ensuring the existence of a badwords.txt file");
if (!existsSync("configs/badwords.txt"))
  writeFileSync("configs/badwords.txt", "", { encoding: "utf-8" });

logger.silly("ensuring the existence of a welcome.txt file");
if (!existsSync("configs/welcome.txt"))
  copyFileSync("configs/welcome.default.txt", "configs/welcome.txt");

logger.silly("creating the discord client");
const client = new DiscordClient();
logger.silly("initializing the database");
logger.silly("creating the pterodactyl client");
logger.info("Discord Client logging in.");
client.login(config.discord.token);
export async function stop() {
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

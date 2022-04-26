import { db } from "../../../modules/db.js";
import logger from "../../../modules/logger.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
    message.channel.send("Der Bot fährt herunter.");
    await db.close();
    logger.info("Bot has stopped");
    client.destroy();
    setTimeout(() => process.exit(0), 10000).unref();
}
export { perm, run };

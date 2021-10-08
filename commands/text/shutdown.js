import { db } from "../../modules/db.js";
import { permissions } from "../../modules/utils.js";

const aliases = ["shutdown", "sd"];
const perm = permissions.dev;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message) {
    message.channel.send("Der bot fährt herunter.");
    await db.close();
    client.destroy();
    setTimeout(() => process.exit(0), 10000).unref();
}

export { aliases, perm, run };

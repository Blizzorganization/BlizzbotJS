import { permissions } from "../../modules/utils.js";

const aliases = ["syncwhitelist"];
const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
    await client.syncWhitelist();
    message.channel.send("Die Whitelist wurde synchronisert.");
}

export { aliases, perm, run };

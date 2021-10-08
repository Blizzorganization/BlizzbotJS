import { permissions } from "../../modules/utils.js";

const aliases = ["say"];
const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const text = args.join(" ");
    const channel = client.channels.resolve(client.config.channels.standard);
    if (!channel.isText()) return message.channel.send("Der in der Config angegebene Kanal ist kein Textkanal.");
    channel.send(text);
}

export { aliases, perm, run };

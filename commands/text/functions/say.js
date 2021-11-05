import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const text = args.join(" ");
    let channel = client.channels.resolve(client.config.channels.standard);
    if (!channel) channel = await client.channels.fetch(client.config.channels.standard);
    if (!(channel.isText())) return message.channel.send("Der in der Config angegebene Kanal ist kein Textkanal.");
    channel.send(text);
}

export { perm, run };

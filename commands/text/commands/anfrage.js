import logger from "../../../modules/logger.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
    const msg = await message.author.send("Bitte schreiben Sie mir Ihre Anfrage in einer Nachricht:").catch((reason) => {message.channel.send("Beim Senden der Nachricht ist ein Fehler aufgetreten: " + reason.toString());});
    if (!msg) return;
    const coll = msg.channel.createMessageCollector({ max: 1, filter: (m) => m.author.id === message.author.id });
    coll.on("collect", async (m) => {
        m.channel.send("Vielen Dank für Ihre Anfrage!");
        if (!client.anfrageChannel) client.anfrageChannel = await client.channels.fetch(client.config.channels.anfrage);
        if (!client.anfrageChannel || !client.anfrageChannel.isText()) {
            logger.info("Anfrage: " + m.author.tag + ": " + m.content);
            return logger.error("Der Anfrage Kanal ist kein Textkanal.");
        }
        if (m.content) {
            client.anfrageChannel.send(`${m.author.tag}: ${m.content}`);
        } else if (m.attachments) {
            const atts = [...m.attachments.values()];
            client.anfrageChannel.send({ content: m.author.tag, files: atts });
        }
    });
}
export { perm, run };

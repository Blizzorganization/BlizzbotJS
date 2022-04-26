import { SlashCommandBuilder } from "@discordjs/builders";
import { User } from "discord.js";
import logger from "../../modules/logger.js";
import { permissions } from "../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").CommandInteraction} interaction
 */
async function run(client, interaction) {
    let user = interaction.member.user;
    if (!(user instanceof User)) user = await client.users.fetch(user.id);
    const msg = await user.send("Bitte schreiben Sie mir Ihre Anfrage in einer Nachricht:").catch((reason) => {
        interaction.reply(`Beim Senden der Nachricht ist ein Fehler aufgetreten: ${reason.toString()}`);
        return;
    });
    await interaction.reply({ content: "Sie haben eine neue Direktnachricht erhalten.", ephemeral: true });
    if (!msg) return;
    const coll = msg.channel.createMessageCollector({ max: 1, filter: (m) => m.author.id === interaction.member.user.id });
    coll.on("collect", async (m) => {
        m.channel.send("Vielen Dank für Ihre Anfrage!");
        if (!client.anfrageChannel) client.anfrageChannel = await client.channels.fetch(client.config.channels.anfrage);
        if (!client.anfrageChannel || !client.anfrageChannel.isText()) {
            logger.info("Anfrage: " + m.author.tag + ": " + m.content);
            logger.error("Der Anfrage Kanal ist kein Textkanal.");
            return;
        }
        if (m.content) {
            client.anfrageChannel.send(`${m.author.tag}: ${m.content}`);
        } else if (m.attachments) {
            const atts = [...m.attachments.values()];
            client.anfrageChannel.send({ content: m.author.tag, files: atts });
        }
    });
}
const setup = new SlashCommandBuilder()
    .setName("anfrage")
    .setDescription("Sende eine Anfrage an die Moderatoren").toJSON();

export { perm, run, setup };

import { ChannelType, SlashCommandBuilder } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
    const text = interaction.options.getString("message", true);
    let channel = interaction.options.getChannel("channel", false);
    if (!channel) channel = await client.channels.fetch(client.config.channels.standard);
    if (channel?.type !== ChannelType.GuildText) return interaction.reply("Der in der Config angegebene Kanal ist kein Textkanal.");
    await channel?.send(text);
    await interaction.deferReply();
}
const setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("say")
    .setDescription("Send a message using the bot")
    .setDescriptionLocalization("de", "Gibt eine Nachricht über den Bot aus")
    .addStringOption((option) => option
        .setName("message")
        .setNameLocalization("de", "nachricht")
        .setDescription("The message to be sent")
        .setDescriptionLocalization("de", "Die Nachricht, die gesendet werden soll")
        .setRequired(true),
    )
    .addChannelOption((option) => option
        .setName("channel")
        .setNameLocalization("de", "kanal")
        .setDescription("The channel the message is sent to, defaults to the general channel")
        .setDescriptionLocalization("de", "Der Kanal in den die Nachricht geschickt wird")
        .setRequired(false),
    )
    .toJSON();

export { perm, run, setup };
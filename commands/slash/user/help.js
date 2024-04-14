import { SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "../../../modules/db.js";
import { MessageEmbed } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
    const embed = new MessageEmbed()
        .setThumbnail(client.user.avatarURL({ format: "png" }))
        .setTitle("**__Der Bot kann folgende Befehle:__**")
        .setColor(0xedbc5d)
        .addField("/minecraft [Name]", "Registriere deinen Minecraft-Account")
        .addField("/minecraftname [Name]", "Gibt deinen aktuellen Minecraft-Account wieder")
        .addField("/rank [Name]", "Gibt Erfahrung wieder")
        .addField("/ranking [Name]", "Zeigt die Aktuelle Rangliste an")
        .addField("/anfrage", "Schreibe dem Bot eine Anfrage, die direkt an die Moderatoren privat weitergeleitet werden");

    const ccmds = (await CustomCommand.findAll()).map((c) => `${client.config.prefix}${c.commandName}`);
    if (ccmds.length > 0) embed.addField("**__Temporäre Befehle:__**", ccmds.join(", "));
    interaction.reply({ embeds: [embed] });
}
const setup = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the currently existing commands")
    .setDescriptionLocalization("de", "Zeigt die Hilfe an welche Befehle derzeit exestieren").toJSON();

export { perm, run, setup };
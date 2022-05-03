import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { MCUser } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").CommandInteraction} interaction
 */
async function run(client, interaction) {
    const user = interaction.options.getUser("user") || interaction.member.user;
    const mcUser = await MCUser.findByPk(user.id);
    if (!mcUser || !mcUser.get("mcId")) return interaction.reply({ content: "Dein Minecraft Name konnte nicht gefunden werden." });
    const embed = new MessageEmbed()
        .setTitle(user.username)
        .setColor(0xedbc5d)
        .setThumbnail(`https://crafatar.com/renders/body/${mcUser.get("mcId")}?overlay`)
        .addField("Minecraft-Name", mcUser.get("mcName").toString());
    interaction.reply({ embeds: [embed] });
}

const setup = new SlashCommandBuilder()
    .addUserOption(
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("Der Nutzer, dessen Minecraft Namen du wissen möchtest")
            .setRequired(false),
    )
    .setName("minecraftname")
    .setDescription("Frage einen Minecraft Namen ab").toJSON();

export { perm, run, setup };

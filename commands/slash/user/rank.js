import { SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { XPUser } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
    const user = interaction.options.getUser("user") || interaction.member.user;
    const xpUser = await XPUser.findOne({ where: { discordId: user.id, guildId: interaction.guildId } });
    if (!xpUser) return interaction.reply("Benutzer nicht in Datenbank vorhanden.");
    const postition = await xpUser.getPosition();
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton({
                emoji: client.emojis.resolve(client.config.emojis.left),
                customId: "left",
                style: "PRIMARY",
                label: "Links",
                disabled: postition == 1,
            }),
            new MessageButton({
                emoji: client.emojis.resolve(client.config.emojis.right),
                customId: "right",
                style: "PRIMARY",
                label: "Rechts",
            }),
        );
    const embed = new MessageEmbed()
        .setTitle("Rangfunktion")
        .setColor(0xedbc5d)
        .setThumbnail(user.avatarURL({ dynamic: true }))
        .addField("Benutzer", user.username, false)
        .addField("Rang", `${postition}`, true)
        .addField("Exp", xpUser.get("experience").toString(), true);
    interaction.reply({
        embeds: [embed],
        components: [row],
    });
}

const setup = new SlashCommandBuilder()
    .addUserOption(
        new SlashCommandUserOption()
            .setName("user")
            .setRequired(false)
            .setDescriptionLocalization("de", "Der Nutzer, dessen Rang du wissen möchtest")
            .setDescription("The user you want to get the rank for"),
    )
    .setName("rank")
    .setDescription("Check a user's rank")
    .setDescriptionLocalization("de", "Frage den Rang eines Nutzers ab").toJSON();

export { perm, run, setup };

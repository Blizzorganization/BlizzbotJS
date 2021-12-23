import { SlashCommandBuilder, SlashCommandNumberOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { XPUser } from "../../modules/db.js";
import { permissions } from "../../modules/utils.js";

const perm = permissions.user;
/**
* @param  {import("../../modules/DiscordClient.js").default} client
* @param  {import("discord.js").CommandInteraction} interaction
*/
async function run(client, interaction) {
    const ranking = await XPUser.findAll({
        where: {
            available: true,
            guildId: interaction.guildId,
        },
        order: [["experience", "DESC"]],
        limit: 10,
    });
    const embeds = [];
    for (const user of ranking) {
        const dUser = client.users.resolve(user.get("discordId").toString()) || await client.users.fetch(user.get("discordId").toString()).catch(() => {
            return { username: "Unbekannt", avatarURL: client.user.avatarURL };
        });
        const embed = new MessageEmbed()
            .setTitle(user.get("username").toString() || dUser.username)
            .setColor(0xedbc5d + 10 * embeds.length)
            .setThumbnail(dUser.avatarURL({ dynamic: true }))
            .addField("Rang", (embeds.length + 1).toString(), true)
            .addField("Exp", user.get("experience").toString() || "0", true);
        embeds.push(embed);
    }
    interaction.reply({ embeds });
}

const setup = new SlashCommandBuilder()
    .addNumberOption(
        new SlashCommandNumberOption()
            .setName("seite")
            .setDescription("Welche Seite möchtest du dir anzeigen lassen?")
            .setRequired(true),
    )
    .setName("ranking")
    .setDescription("Zeigt die Rangliste der Erfahrung");

export { perm, run, setup };

import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { XPUser } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
* @param  {import("../../../modules/DiscordClient.js").default} client
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
        offset: 10 * ((interaction.options.getInteger("page") || 1) - 1),
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
    if (embeds.length == 0) {
        embeds.push(new MessageEmbed()
            .setTitle("So viele Nutzer haben keine Erfahrung gesammelt.")
            .setColor(0xCC0000));
    }
    interaction.reply({ embeds });
}

const setup = new SlashCommandBuilder()
    .addIntegerOption(
        new SlashCommandIntegerOption()
            .setName("page")
            .setNameLocalization("de", "seite")
            .setDescription("The page to show")
            .setDescriptionLocalization("de", "Die Seite, die dir angezeigt werden soll")
            .setRequired(false),
    )
    .setName("ranking")
    .setDescription("Shows the current experience ranking")
    .setDescriptionLocalization("de", "Zeigt die Rangliste der Erfahrung").toJSON();

export { perm, run, setup };

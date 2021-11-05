import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { XPUser } from "../../../modules/db.js";
import { getUser, permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const user = getUser(client, message, args) || message.author;
    const xpUser = await XPUser.findOne({ where: { discordId: user.id, guildId: message.guildId } });
    if (!xpUser) return message.channel.send("Benutzer nicht in Datenbank vorhanden.");
    const postition = await xpUser.getPosition();
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton({
                emoji: client.emojis.resolve(client.config.emojis.left),
                customId: "left",
                style: "PRIMARY",
                label: "Links",
                // @ts-ignore
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
    message.channel.send({
        embeds: [embed],
        components: [row],
    });
}

export { perm, run };

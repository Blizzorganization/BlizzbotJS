import { getUser, permissions } from "../../modules/utils.js";
import { MCUser } from "../../modules/db.js";
import { MessageEmbed } from "discord.js";

const aliases = ["minecraftname", "mcname"];
const perm = permissions.user;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const user = getUser(client, message, args) || message.author;
    if (!user) return message.channel.send("Dieser Nutzer konnte nicht gefunden werden.");
    const mcUser = await MCUser.findByPk(user.id);
    if (!mcUser || !mcUser.mcId) return message.channel.send("Dein Minecraft Name konnte nicht gefunden werden.");
    const embed = new MessageEmbed()
        .setTitle(user.username)
        .setColor(0xedbc5d)
        .setThumbnail(`https://crafatar.com/renders/body/${mcUser.mcId}?overlay`)
        .addField("Minecraft-Name", mcUser.mcName);
    message.channel.send({ embeds: [embed] });
}

export { aliases, perm, run };
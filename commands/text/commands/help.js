import { MessageEmbed } from "discord.js";
import { CustomCommand } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message) {
    const embed = new MessageEmbed()
        .setThumbnail(client.user.avatarURL({ format: "png" }))
        .setTitle("**__Der Bot kann folgende Befehle:__**")
        .setColor(0xedbc5d)
        .addField(`${client.config.prefix}mc [Name]`, "Registriere deinen Minecraft-Account")
        .addField(`${client.config.prefix}mcname [Name]`, "Gibt deinen aktuellen Minecraft-Account wieder")
        .addField(`${client.config.prefix}rank [Name]`, "Gibt Erfahrung wieder")
        .addField(`${client.config.prefix}anfrage`, "Schreibe dem Bot eine Anfrage, die direkt an die Moderatoren privat weitergeleitet werden");

    const ccmds = (await CustomCommand.findAll()).map((c) => `${client.config.prefix}${c.commandName}`);
    if (ccmds.length > 0) embed.addField("**__Temporäre Befehle:__**", ccmds.join(", "));

    message.channel.send({ embeds: [embed] });
}
export { perm, run };

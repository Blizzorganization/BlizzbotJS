import { MessageEmbed } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message) {
    const embed = new MessageEmbed()
        .setTitle("**__Der Bot kann folgende Befehle__**")
        .setColor(0xedbc5d)
        .addField("!mc [Name]", "Registriere deinen Minecraft-Account")
        .addField("!mcname [Name]", "Gibt deinen aktuellen Minecraft-Account wieder")
        .addField("!rank [Name]", "Gibt Erfahrung wieder")
        .addField("!anfrage", "Schreibe dem Bot eine Anfrage, die direkt an die Moderatoren privat weitergeleitet werden");
    message.channel.send({ embeds: [embed] });
}
export { perm, run };

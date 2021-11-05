import { getUser, permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const toMute = getUser(client, message, args);
    if (!toMute) {
        message.reply({ content: "Ich finde keinen solchen Nutzer." });
        return;
    }
    const member = message.guild.members.resolve(toMute);
    if (!member) {
        message.reply({ content: "Dieser Nutzer scheint nicht auf diesem Discord zu sein." });
        return;
    }
    try {
        member.roles.add(client.config.roles.mute).catch();
    } catch (e) {
        message.reply({ content: "Ein Fehler ist aufgetreten: " + e.message });
        return;
    }
    message.react("✅");
}

export { perm, run };

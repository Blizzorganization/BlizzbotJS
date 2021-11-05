import { MCUser, XPUser } from "../../../modules/db.js";
import { getUser, permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 1) return message.channel.send("Du musst einen Nutzer angeben, den du zurücksetzen möchtest.");
    const user = getUser(client, message, args);
    MCUser.destroy({ where: { discordId: user.id }, limit: 1 });
    XPUser.destroy({ where: { discordId: user.id, guildId: message.guildId } });
    message.channel.send("Der Nutzer wurde zurückgesetzt.");
}

export { perm, run };

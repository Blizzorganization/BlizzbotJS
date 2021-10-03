import { XPUser } from "../../modules/db.js";
import { getUser, permissions } from "../../modules/utils.js";

const aliases = ["resetrank"];
const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 1) return message.channel.send("Du musst angeben, wessen Rang du zurücksetzen möchtest.");
    const user = getUser(client, message, args);
    (await XPUser.findOne({ where: { discordId: user.id, guildId: message.guildId } })).update("experience", 0);
    message.channel.send("Der Rang dieses Nutzers wurde zurückgesetzt.");
}

export { aliases, perm, run };
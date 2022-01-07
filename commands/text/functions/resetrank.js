import { XPUser } from "../../../modules/db.js";
import { getUser, permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 1) return message.channel.send("Du musst angeben, wessen Rang du zurücksetzen möchtest.");
    const user = getUser(client, message, args);
    const xpuser = (await XPUser.findOne({ where: { discordId: user.id, guildId: message.guildId } })).update({ experience: 0 });
    await (await xpuser).save();
    message.channel.send("Der Rang dieses Nutzers wurde zurückgesetzt.");
}
export { perm, run };

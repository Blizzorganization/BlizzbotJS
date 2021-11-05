import { Util } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
    const blwords = client.blacklist;
    if (blwords.length == 0) return message.channel.send("Die Blacklist ist leer.");
    const joinedBlacklist = "```fix\n" + blwords.join("\n") + "```";
    const sendable = Util.splitMessage(joinedBlacklist, {
        append: "```",
        char: "\n",
        prepend: "```fix\n",
    });
    for (const toSend of sendable) {
        await message.channel.send(toSend);
    }
}

export { perm, run };

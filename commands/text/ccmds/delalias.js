import { Alias } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 0) {
        message.reply({
            content: "Du musst angeben, welchen Alias du löschen möchtest.",
        });
        return;
    }
    const name = args.shift().toLowerCase();
    const alias = await Alias.findOne({ where: { name } });
    if (!alias) {
        message.reply({ content: "Ich kenne keinen solchen Alias." });
        return;
    }
    await alias.destroy();
    message.reply({ content: `Der Alias ${name} wurde gelöscht.` });
}

export { perm, run };

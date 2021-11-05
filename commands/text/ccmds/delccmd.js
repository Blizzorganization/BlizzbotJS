import { CustomCommand } from "../../../modules/db.js";
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
            content: "Du musst angeben, welchen Befehl du löschen möchtest.",
        });
        return;
    }
    const name = args.shift().toLowerCase();
    const ccmd = await CustomCommand.findOne({ where: { commandName: name } });
    if (!ccmd) {
        message.reply({ content: "Ich kenne keinen solchen Befehl." });
        return;
    }
    await ccmd.destroy();
    message.reply({ content: `Der Befehl ${name} wurde gelöscht.` });
}

export { perm, run };

import { Alias, CustomCommand } from "../../../modules/db.js";
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
    let name = args.shift().toLowerCase();
    if (name.startsWith(client.config.prefix)) name = name.replace(client.config.prefix, "");
    const ccmd = await CustomCommand.findOne({ where: { commandName: name } });
    if (!ccmd) {
        message.reply({ content: "Ich kenne keinen solchen Befehl." });
        return;
    }
    await ccmd.destroy();
    const linkedAliases = await Alias.destroy({ where: {
        command: name,
        type: "ccmd",
    } });
    message.reply({ content: `Der Befehl ${client.config.prefix}${name} und seine ${linkedAliases} zugehörigen Aliase wurden gelöscht.` });
}
export { perm, run };

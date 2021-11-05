import { CustomCommand } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message) {
    const cmds = await CustomCommand.findAll();
    const commandNames = cmds.map((cmd) => cmd.commandName);
    message.reply({ content: `Es existieren folgende Befehle: ${commandNames.join(", ")}` });
}

export { perm, run };

import { CustomCommand } from "../../../modules/db.js";
import logger from "../../../modules/logger.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 2) {
        message.reply({
            content: "Du musst mindestens zwei Argumente angeben:\nDen Namen des Befehls und die Antwort.",
        });
        return;
    }
    let name = args.shift().toLowerCase();
    if (name.startsWith(client.config.prefix)) name = name.replace(client.config.prefix, "");
    const response = args.join(" ");
    const lastEditor = message.author.id;
    const ccmd = await CustomCommand.create({
        commandName: name,
        response,
        lastEditedBy: lastEditor,
    });
    logger.info(`Added Customcommand: ${ccmd.commandName}`);
    message.reply({ content: `Der Befehl ${client.config.prefix}${ccmd.commandName} wurde hinzugefügt` });
}
export { perm, run };

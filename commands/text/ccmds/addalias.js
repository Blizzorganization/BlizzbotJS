import { Alias, CustomCommand } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 3) {
        message.reply({ content: "Du musst drei Argumente angeben:\nDen Namen, den Typ (ccmd/cmd) und auf welchen Befehl verwiesen werden soll." });
        return;
    }
    const name = args.shift().toLowerCase();
    const type = args.shift().toLowerCase();
    const ref = args.shift().toLowerCase();
    switch (type) {
        case "ccmd":
            {
                const ccmd = CustomCommand.findOne({ where: { commandName: ref } });
                if (!ccmd) {
                    message.channel.send({ content: "Diesen CustomCommand kenne ich nicht." });
                    return;
                }
            }
            break;
        case "cmd":
            if (!client.commands.has(ref)) {
                message.channel.send({ content: "Diesen Befehl kenne ich nicht." });
            }
            break;
        default:
            message.channel.send({ content: "Es gibt nur die Typen \"cmd\" und \"ccmd\"." });
            return;
    }
    await Alias.create({
        name,
        type,
        command: ref,
    });
    message.channel.send({ content: "Der Alias wurde erstellt." });
}

export { perm, run };

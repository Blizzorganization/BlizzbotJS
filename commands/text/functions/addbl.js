import { writeFileSync } from "fs";
import { EOL } from "os";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 1) return message.channel.send("Bitte geben Sie ein Wort an, welches zur Blacklist hinzugefügt werden soll!");
    client.blacklist.push(args.join(" ").toLowerCase());
    client.blacklist = client.blacklist.sort();
    writeFileSync("configs/badwords.txt", client.blacklist.join(EOL));
    message.channel.send(`Das Wort \`${args.join(" ").toLowerCase()}\` wurde der Blacklist hinzugefügt.`);
}
export { perm, run };
import { permissions } from "../../modules/utils.js";
import { writeFileSync } from "fs";
import { EOL } from "os";

const aliases = [];
const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || args.length < 1) return message.channel.send("Bitte geben Sie ein Wort an, welches aus der Blacklist entfernt werden soll!");
    const word = args.join(" ").toLowerCase();
    if (!client.blacklist.includes(word)) return message.channel.send("Dieses Wort ist nicht in der Blacklist enthalten.");
    client.blacklist = client.blacklist.filter((blWord) => blWord !== word);
    writeFileSync("badwords.txt", client.blacklist.join(EOL));
    message.channel.send("Ihre Eingabe wurde von der Blacklist entfernt.");
}

export { aliases, perm, run };
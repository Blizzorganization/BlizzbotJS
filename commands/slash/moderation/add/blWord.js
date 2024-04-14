import { writeFileSync } from "node:fs";
import { EOL } from "node:os";

/**
 * @param  {import("../../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function addBLWord(client, interaction) {
    const word = interaction.options.getString("word", true).toLowerCase();
    client.blacklist.push(word);
    client.blacklist = client.blacklist.sort();
    writeFileSync("configs/badwords.txt", client.blacklist.join(EOL));
    interaction.reply(`Das Wort \`${word}\` wurde der Blacklist hinzugefügt.`);
}
import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import type DiscordClient from "$/modules/DiscordClient";
import type { ChatInputCommandInteraction } from "discord.js";

export async function addBLWord(
  client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  const word = interaction.options.getString("word", true).toLowerCase();
  client.blacklist.push(word);
  client.blacklist = client.blacklist.sort();
  writeFileSync("configs/badwords.txt", client.blacklist.join(EOL));
  interaction.reply(`Das Wort \`${word}\` wurde der Blacklist hinzugefügt.`);
}

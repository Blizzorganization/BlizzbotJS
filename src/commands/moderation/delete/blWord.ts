import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import type DiscordClient from "$/modules/DiscordClient";
import type { ChatInputCommandInteraction } from "discord.js";

export async function deleteBLWord(
  client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  const word = interaction.options.getString("word", true).toLowerCase();
  if (!client.blacklist.includes(word))
    return await interaction.reply(
      "Dieses Wort ist nicht in der Blacklist enthalten.",
    );
  client.blacklist = client.blacklist.filter((blWord) => blWord !== word);
  writeFileSync("configs/badwords.txt", client.blacklist.join(EOL));
  interaction.reply(`Das Wort \`${word}\` wurde von der Blacklist entfernt.`);
}

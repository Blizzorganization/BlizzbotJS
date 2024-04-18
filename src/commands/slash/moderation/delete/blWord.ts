import { writeFileSync } from "node:fs";
import { EOL } from "node:os";

/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function deleteBLWord(client, interaction) {
  const word = interaction.options.getString("word", true).toLowerCase();
  if (!client.blacklist.includes(word))
    return interaction.reply(
      "Dieses Wort ist nicht in der Blacklist enthalten.",
    );
  client.blacklist = client.blacklist.filter((blWord) => blWord !== word);
  writeFileSync("configs/badwords.txt", client.blacklist.join(EOL));
  interaction.reply(`Das Wort \`${word}\` wurde von der Blacklist entfernt.`);
}

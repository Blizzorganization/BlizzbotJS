import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { splitMessage } from "$/modules/splitMessage";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export default new (class BlacklistCommand extends Command {
  public perm = permissions.mod;
  public name = "blacklist";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("blacklist")
    .setDescription("Shows the current blacklist")
    .setDescriptionLocalization("de", "Zeigt die Aktuelle Blacklist an")
    .toJSON();
  public async run(
    client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const blwords = client.blacklist;
    if (blwords.length === 0) {
      await interaction.reply("Die Blacklist ist leer.");
      return;
    }
    const joinedBlacklist = `\`\`\`fix\n${blwords.join("\n")}\`\`\``;
    const sendable = splitMessage(joinedBlacklist, {
      append: "```",
      char: "\n",
      prepend: "```fix\n",
    });
    let replied = false;
    for (const toSend of sendable) {
      if (!replied) {
        await interaction.reply(toSend);
        replied = true;
      } else {
        await interaction.reply(toSend);
      }
    }
  }
})();

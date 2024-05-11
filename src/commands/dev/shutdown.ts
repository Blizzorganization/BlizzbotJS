import { stop } from "$/blizzbot";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export default new (class ShutdownCommand extends Command {
  public perm = permissions.dev;
  public name = "shutdown";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("shutdown")
    .setDescription("stop the bot")
    .setDescriptionLocalization("de", "Fährt den Bot runter")
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply(
      interaction.locale === "de"
        ? "Der Bot fährt herunter."
        : "Shutting down...",
    );
    await stop();
  }
})();

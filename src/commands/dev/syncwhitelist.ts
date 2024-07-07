import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { permissions } from "$/modules/utils";
import {
  type CacheType,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export default new (class SyncwhitelistCommand extends Command {
  public perm = permissions.dev;
  public name = "syncwhitelist";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("syncwhitelist")
    .setDescription("synchronizes the whitelist")
    .setDescriptionLocalization("de", "Syncronisiert die Whitelist")
    .toJSON();
  public async run(
    client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await client.syncWhitelist();
    await interaction.reply(
      interaction.locale === "de"
        ? "Die Whitelist wurde synchronisert."
        : "Synchronized the whitelist.",
    );
  }
})();

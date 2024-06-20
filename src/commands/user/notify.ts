import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import { SlashCommandBuilder } from "discord.js";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";

export default new (class NotifyCommand extends Command {
  public perm = permissions.user;
  public name = "notify";
  public setup = new SlashCommandBuilder()
    .setName("notify")
    .setDescription("Enable or disable pings for streams/videos")
    .setDescriptionLocalization(
      "de",
      "Aktiviere oder Deaktiviere die Pings für Streams/Videos",
    )
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inCachedGuild()) return;
    const member = interaction.member;
    if (member.roles.resolve(config.discord.roles.notify)) {
      await member.roles.remove(config.discord.roles.notify);
      await interaction.reply({
        content: "Notify Rolle entfernt",
        ephemeral: true,
      });
      logger.debug("delete role.");
      return;
    }
    // TODO: handle possible errors
    await member.roles.add(config.discord.roles.notify);
    await interaction.reply({
      content: "Notify Rolle hinzugefügt",
      ephemeral: true,
    });
    logger.debug("added role.");
  }
})();

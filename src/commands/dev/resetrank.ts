import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import {
  type CacheType,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { and, eq } from "drizzle-orm";

export default new (class ResetrankCommand extends Command {
  public perm = permissions.dev;
  public name = "resetrank";
  public setup = new SlashCommandBuilder()
    .setName("resetrank")
    .setDescription("Reset a user's rank")
    .setDescriptionLocalization("de", "Setzt den Rang des Users zurück")
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalization("de", "nutzer")
        .setDescription("The user to reset the rank for")
        .setDescriptionLocalization(
          "de",
          "Der Nutzer dessen Rang zurückgesetzt werden soll",
        )
        .setRequired(true),
    )
    .toJSON();
  public async run(
    _client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inGuild()) return;
    const user = interaction.options.getUser("user", true);
    logger.debug(`Resetting rank for @${user.username} (${user.id})`);
    const [xpuser] = await db
      .update(ranking)
      .set({ experience: 0 })
      .where(
        and(
          eq(ranking.discordId, BigInt(user.id)),
          eq(ranking.guildId, BigInt(interaction.guildId)),
        ),
      )
      .returning();
    if (!xpuser) {
      logger.debug("No user to reset rank for.");
      await interaction.reply(
        interaction.locale === "de"
          ? "Dieser Nutzer hat bisher keine Erfahrung gesammelt."
          : "This user didn't collect any experience so far.",
      );
      return;
    }
    logger.debug("Successfully reset user's rank.");
    await interaction.reply(
      interaction.locale === "de"
        ? "Der Rang dieses Nutzers wurde zurückgesetzt."
        : "The user's rank has been reset.",
    );
  }
})();

import { mcnames } from "$/db/mcnames";
import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { and, eq } from "drizzle-orm";

export default new (class ResetuserCommand extends Command {
  public perm = permissions.dev;
  public name = "resetuser";
  public setup = new SlashCommandBuilder()
    .setName("resetuser")
    .setDescription("Deletes a user's data from the database")
    .setDescriptionLocalization(
      "de",
      "Löscht alle Daten vom User aus der Datenbank",
    )
    .addUserOption((option) =>
      option
        .setDescriptionLocalization(
          "de",
          "Der Nutzer dessen Daten gelöscht werden sollen",
        )
        .setDescription("The user to reset the data for")
        .setName("user")
        .setRequired(true)
        .setNameLocalization("de", "nutzer"),
    )
    .toJSON();
  public async run(
    _client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inGuild()) return;
    const user = interaction.options.getUser("name", true);
    logger.debug(`Resetting user @${user.username} (${user.id})`);
    await db.delete(mcnames).where(eq(mcnames.discordId, BigInt(user.id)));
    logger.debug("Deleted mcname if set.");
    await db
      .delete(ranking)
      .where(
        and(
          eq(ranking.discordId, BigInt(user.id)),
          eq(ranking.guildId, BigInt(interaction.guildId)),
        ),
      );
    logger.debug("Deleted experience if available.");
    await interaction.reply(
      interaction.locale === "de"
        ? "Der Nutzer wurde zurückgesetzt."
        : "The user has been reset.",
    );
  }
})();

import { Aliases } from "$/db/Aliases";
import type DiscordClient from "$/modules/DiscordClient";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import type { ChatInputCommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export async function deleteAlias(
  _client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  const aliasName = interaction.options.getString("name", true);
  logger.info(`Deleting alias ${aliasName}`);
  const [alias] = await db
    .delete(Aliases)
    .where(eq(Aliases.name, aliasName))
    .returning();
  if (!alias) {
    logger.info(`Alias ${aliasName} did not exist.`);
    await interaction.reply(
      interaction.locale === "de"
        ? `Es gibt keinen Alias ${aliasName}`
        : `There is no alias ${aliasName}`,
    );
    return;
  }
  await interaction.reply(
    interaction.locale === "de"
      ? `Der Alias ${alias.name} wurde gelöscht.`
      : `Deleted alias ${alias.name}`,
  );
  logger.info(`Deleted alias ${alias.name}`);
}

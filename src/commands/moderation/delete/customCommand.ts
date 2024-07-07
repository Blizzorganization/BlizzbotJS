import { CustomCommands } from "$/db/CustomCommands";
import type DiscordClient from "$/modules/DiscordClient";
import config from "$/modules/config";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import type { ChatInputCommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export async function deleteCustomCommand(
  _client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  let name = interaction.options.getString("name", true).toLowerCase();
  if (name.startsWith(config.discord.prefix))
    name = name.replace(config.discord.prefix, "");
  logger.info(`Deleting Customcommand: ${name}`);
  const [ccmd] = await db
    .delete(CustomCommands)
    .where(eq(CustomCommands.commandName, name))
    .returning();
  if (!ccmd) {
    await interaction.reply({
      content:
        interaction.locale === "de"
          ? `Es existiert kein Befehl "${config.discord.prefix}${name}".`
          : `There was no CustomCommand "${config.discord.prefix}${name}".`,
    });
    return;
  }
  await interaction.reply({
    content:
      interaction.locale === "de"
        ? `Der Befehl ${config.discord.prefix}${name} wurde gelöscht.`
        : `The CustomCommand ${config.discord.prefix}${name} was deleted`,
  });
}

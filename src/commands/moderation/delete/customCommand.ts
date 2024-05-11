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
  const [ccmd] = await db
    .select()
    .from(CustomCommands)
    .where(eq(CustomCommands.commandName, name));
  logger.info(`Delete Customcommand: ${ccmd?.commandName}`);

  interaction.reply({
    content:
      interaction.locale === "de"
        ? `Der Befehl ${config.discord.prefix}${name} wurde gelöscht.`
        : `The CustomCommand ${config.discord.prefix}${name} was deleted`,
  });
}

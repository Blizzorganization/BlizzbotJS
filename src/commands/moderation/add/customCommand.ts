import { CustomCommands } from "$/db/CustomCommands";
import type DiscordClient from "$/modules/DiscordClient";
import config from "$/modules/config";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import type { ChatInputCommandInteraction } from "discord.js";

export async function addCustomCommand(
  _client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  let name = interaction.options.getString("name", true).toLowerCase();
  if (name.startsWith(config.discord.prefix))
    name = name.replace(config.discord.prefix, "");
  const response = interaction.options.getString("response", true);
  const lastEditor = interaction.user.id;
  const [ccmd] = await db
    .insert(CustomCommands)
    .values({ commandName: name, response, lastEditedBy: BigInt(lastEditor) })
    .returning();
  logger.info(`Added Customcommand: ${ccmd?.commandName}`);
  interaction.reply({
    content:
      interaction.locale === "de"
        ? `Der Befehl ${config.discord.prefix}${ccmd?.commandName} wurde hinzugefügt`
        : `The CustomCommand ${config.discord.prefix}${ccmd?.commandName} was added`,
  });
}

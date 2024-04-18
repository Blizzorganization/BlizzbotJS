import { BaseInteraction } from "discord.js";
import DiscordClient from "../modules/DiscordClient";
import logger from "../modules/logger";

export async function handle(
  client: DiscordClient,
  interaction: BaseInteraction,
) {
  if (!interaction.isCommand()) return;
  const cmd = client.slashCommands.get(interaction.commandName);
  if (cmd) return cmd.run(client, interaction);
  logger.error(`Unknown Command run: ${interaction.commandName}`);
}

export const name = "interactionCreate";

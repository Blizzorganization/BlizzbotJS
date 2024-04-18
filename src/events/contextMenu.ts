import logger from "../modules/logger.js";

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Interaction} interaction
 */
export async function handle(client, interaction) {
  if (!interaction.isContextMenu()) return;
  switch (interaction.commandName) {
    default:
      logger.warn(`Unknown ContextMenu received: ${interaction.commandName}`);
      break;
  }
}
export const disabled = false;
export const name = "interactionCreate";

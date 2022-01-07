import logger from "../modules/logger.js";

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Interaction} interaction
 */
export async function handle(client, interaction) {
    if (!interaction.isApplicationCommand()) return;
    const cmd = client.slashCommands.get(interaction.commandName);
    if (cmd) return cmd.run(client, interaction);
    logger.error(`Unknown Command run: ${interaction.commandName}`);
}
export const disabled = false;
export const name = "interactionCreate";
import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import logger from "$/modules/logger";
import type { CacheType, Interaction } from "discord.js";
import { Events } from "discord.js";

export default new (class SlashCommandHandler extends EventListener<Events.InteractionCreate> {
  public eventName = Events.InteractionCreate as const;
  async handle(
    client: DiscordClient<true>,
    interaction: Interaction<CacheType>,
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) {
      logger.error(`Unknown Command run: ${interaction.commandName}`);
      return;
    }
    if (cmd.disabled) {
      logger.info(`Not running disabled Command ${interaction.commandName}`);
      return;
    }
    logger.info(`Running command ${cmd.name} (${interaction.id})`);
    const preRun = Date.now();
    try {
      await cmd.run(client, interaction);
    } catch (e) {
      logger.error(`command ${cmd.name} failed (${interaction.id})`);
    }
    const afterRun = Date.now();
    logger.info(
      `Completed command ${cmd.name} (${interaction.id}) after ${
        afterRun - preRun
      } ms`,
    );
  }
})();

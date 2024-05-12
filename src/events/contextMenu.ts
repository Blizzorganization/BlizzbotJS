import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import logger from "$/modules/logger";
import type { CacheType, Interaction } from "discord.js";
import { Events } from "discord.js";

export default new (class ContextMenuHandler extends EventListener<Events.InteractionCreate> {
  public eventName = Events.InteractionCreate as const;
  async handle(
    _client: DiscordClient,
    interaction: Interaction<CacheType>,
  ): Promise<void> {
    if (!interaction.isContextMenuCommand()) return;
    switch (interaction.commandName) {
      default:
        logger.warning(
          `Unknown ContextMenu received: ${interaction.commandName}`,
        );
        break;
    }
  }
})();

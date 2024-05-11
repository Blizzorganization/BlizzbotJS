import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import logger from "$/modules/logger";
import { Events } from "discord.js";

export default new (class WarnHandler extends EventListener<Events.Warn> {
  public eventName = Events.Warn as const;
  async handle(_client: DiscordClient, message: string) {
    logger.warn(`[discord.js] ${message}`);
  }
})();

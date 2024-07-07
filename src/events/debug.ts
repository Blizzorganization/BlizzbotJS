import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import logger from "$/modules/logger";
import { Events } from "discord.js";

export default new (class DebugHandler extends EventListener<Events.Debug> {
  public eventName = Events.Debug as const;
  async handle(_client: DiscordClient, message: string) {
    if (import.meta.env.DEBUG_DJS === "1")
      logger.debug(`[discord.js] ${message}`);
  }
})();

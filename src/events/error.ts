import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import logger from "$/modules/logger";
import { Events } from "discord.js";

export default new (class ErrorHandler extends EventListener<Events.Error> {
  public eventName = Events.Error as const;
  async handle(_client: DiscordClient, error: Error) {
    logger.error("Received the following error: ", error);
  }
})();

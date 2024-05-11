import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import logger from "$/modules/logger";
import type { Message } from "discord.js";
import { Events } from "discord.js";
import { checkMessage } from "./message";

export default new (class MessageEditHandler extends EventListener<Events.MessageUpdate> {
  public eventName = Events.MessageUpdate as const;
  async handle(
    client: DiscordClient,
    _oldMessage: Message<boolean>,
    newMessage: Message<boolean>,
  ) {
    logger.silly("message edit received");
    logger.silly("message exists");
    // ignore webhooks
    if (!newMessage.inGuild()) return;
    if (newMessage.webhookId != null) return;
    if (config.discord.channels.ignore.includes(newMessage.channelId)) return;
    await checkMessage(client, newMessage);
  }
})();

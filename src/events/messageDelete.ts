import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import logger from "$/modules/logger";
import type { DiscordAPIError, Message, PartialMessage } from "discord.js";
import { EmbedBuilder, Events } from "discord.js";

export default new (class MessageDeleteHandler extends EventListener<Events.MessageDelete> {
  public eventName = Events.MessageDelete as const;
  async handle(
    client: DiscordClient,
    message: Message<boolean> | PartialMessage,
  ): Promise<void> {
    if (!message.inGuild()) return;
    const embed = new EmbedBuilder()
      .setTitle("Gelöschte Nachricht")
      .setColor(0xedbc5d)
      .addFields(
        {
          name: "Name",
          value: message.author?.username || "Name unbekannt",
          inline: true,
        },
        {
          name: "Channel",
          value: message.channel.name || "Channel unbekannt???",
          inline: true,
        },
      );
    if (message.author?.avatar)
      embed.setThumbnail(message.author.avatarURL({ forceStatic: false }));
    embed.addFields({
      name: "Inhalt",
      value: message.content?.slice(0, 1000) || "Inhalt nicht auslesbar",
      inline: false,
    });
    if (!client.logChannel) return;
    if (!client.logChannel.isTextBased()) {
      logger.warning(`Deleted message as the log channel is not text based:
${message.content || "Inhalt nicht auslesbar"}
by ${message.author.tag} in ${message.channel.name} (${message.guild.name})`);
      return;
    }
    client.logChannel.send({ embeds: [embed] }).catch((e: DiscordAPIError) => {
      logger.error(`Could not send deleted message to the log channel: ${
        e.message
      }
${e.stack}

The message was \`${message.content || "Inhalt nicht auslesbar"}\`
by ${message.author.tag} in ${message.channel.name} (${message.guild.name})`);
    });
  }
})();

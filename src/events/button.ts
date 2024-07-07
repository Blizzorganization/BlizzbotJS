import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import { db } from "$/modules/db";
import type { CacheType, Interaction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  Message,
} from "discord.js";
import { and, desc, eq } from "drizzle-orm";

export default new (class ButtonHandler extends EventListener<Events.InteractionCreate> {
  public eventName = Events.InteractionCreate as const;
  async handle(
    client: DiscordClient,
    interaction: Interaction<CacheType>,
  ): Promise<void> {
    if (!interaction.isButton()) return;
    if (!interaction.inCachedGuild()) return;
    const message = interaction.message;
    if (!(message instanceof Message)) return;
    if (!message.embeds) return;
    const embed = message.embeds[0];
    if (!embed) return;
    switch (embed.title) {
      case "Rangfunktion":
        {
          let position = Number.parseInt(
            message.embeds[0]?.fields.find((f) => f.name === "Rang")?.value ??
              "0",
          );
          if (interaction.customId === "left") {
            position = Math.max(1, position - 1);
          }
          if (interaction.customId === "right") position += 1;
          const [next] = await db
            .selectDistinctOn([ranking.experience])
            .from(ranking)
            .where(
              and(
                eq(ranking.guildId, BigInt(message.guildId)),
                eq(ranking.available, true),
              ),
            )
            .orderBy(desc(ranking.experience))
            .offset(position - 1);
          const newEmbed = new EmbedBuilder(embed.data);
          if (next) {
            const user = client.users.resolve(next.discordId.toString());
            newEmbed.setFields(
              {
                name: "Benutzer",
                value: next.username || user?.username || "Unbekannt",
                inline: false,
              },
              { name: "Rang", value: `${position}`, inline: true },
              { name: "Exp", value: `${next.experience}`, inline: true },
            );
            const avatarUrl = user
              ? user.avatarURL({ forceStatic: false })
              : client.user?.avatarURL({ forceStatic: false });
            if (avatarUrl) newEmbed.setThumbnail(avatarUrl);
          } else {
            newEmbed.setFields(
              { name: "Fehler", value: "Kein Benutzer gefunden" },
              { name: "Rang", value: `${position || 0}` },
            );
            if (client.user)
              newEmbed.setThumbnail(
                client.user.avatarURL({ forceStatic: false }),
              );
          }
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
              emoji: config.discord.emojis.left,
              customId: "left",
              style: ButtonStyle.Primary,
              label: "Links",
              disabled: position === 1,
            }),
            new ButtonBuilder({
              emoji: config.discord.emojis.right,
              customId: "right",
              style: ButtonStyle.Primary,
              label: "Rechts",
              disabled: next === null,
            }),
          );
          await interaction.update({ embeds: [newEmbed], components: [row] });
        }
        break;
      default:
        break;
    }
  }
})();

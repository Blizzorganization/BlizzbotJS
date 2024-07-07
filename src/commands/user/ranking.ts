import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { db } from "$/modules/db";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
} from "discord.js";
import { and, desc, eq } from "drizzle-orm";

export default new (class RankingCommand extends Command {
  public perm = permissions.user;
  public name = "ranking";
  public setup = new SlashCommandBuilder()
    .addIntegerOption(
      new SlashCommandIntegerOption()
        .setName("page")
        .setNameLocalization("de", "seite")
        .setDescription("The page to show")
        .setDescriptionLocalization(
          "de",
          "Die Seite, die dir angezeigt werden soll",
        )
        .setRequired(false),
    )
    .setName("ranking")
    .setDescription("Shows the current experience ranking")
    .setDescriptionLocalization("de", "Zeigt die Rangliste der Erfahrung")
    .toJSON();
  public async run(
    client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inCachedGuild()) return;
    const ranks = await db
      .select()
      .from(ranking)
      .where(
        and(
          eq(ranking.available, true),
          eq(ranking.guildId, BigInt(interaction.guildId)),
        ),
      )
      .orderBy(desc(ranking.experience))
      .limit(10)
      .offset(10 * ((interaction.options.getInteger("page") || 1) - 1));
    const embeds: EmbedBuilder[] = [];
    for (const user of ranks) {
      const dUser =
        client.users.resolve(user.discordId.toString()) ||
        (await client.users.fetch(user.discordId.toString()).catch(() => {
          return { username: "Unbekannt", avatarURL: client.user.avatarURL };
        }));
      const embed = new EmbedBuilder()
        .setTitle(user.username || dUser.username)
        .setColor(0xedbc5d + 10 * embeds.length)
        .setThumbnail(dUser.avatarURL({ forceStatic: false }))
        .addFields(
          {
            name: "Rang",
            value: (embeds.length + 1).toString(),
            inline: true,
          },
          {
            name: "Exp",
            value: user.experience.toString() || "0",
            inline: true,
          },
        );
      embeds.push(embed);
    }
    if (embeds.length === 0) {
      embeds.push(
        new EmbedBuilder()
          .setTitle("So viele Nutzer haben keine Erfahrung gesammelt.")
          .setColor(0xcc0000),
      );
    }
    interaction.reply({ embeds });
  }
})();

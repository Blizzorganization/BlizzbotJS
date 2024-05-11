import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import { db } from "$/modules/db";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import { and, countDistinct, eq, gte } from "drizzle-orm";

export default new (class RankCommand extends Command {
  public perm = permissions.user;
  public name = "rank";
  public setup = new SlashCommandBuilder()
    .addUserOption(
      new SlashCommandUserOption()
        .setName("user")
        .setRequired(false)
        .setDescriptionLocalization(
          "de",
          "Der Nutzer, dessen Rang du wissen möchtest",
        )
        .setDescription("The user you want to get the rank for"),
    )
    .setName("rank")
    .setDescription("Check a user's rank")
    .setDescriptionLocalization("de", "Frage den Rang eines Nutzers ab")
    .toJSON();
  public async run(
    _client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inCachedGuild()) return;
    const user = interaction.options.getUser("user") || interaction.member.user;
    const [xpUser] = await db
      .select()
      .from(ranking)
      .where(
        and(
          eq(ranking.discordId, BigInt(user.id)),
          eq(ranking.guildId, BigInt(interaction.guildId)),
        ),
      );
    if (!xpUser) {
      await interaction.reply("Benutzer nicht in Datenbank vorhanden.");
      return;
    }
    const [postitionObj] = await db
      .select({ position: countDistinct(ranking.experience) })
      .from(ranking)
      .where(gte(ranking.experience, xpUser.experience));
    const position = postitionObj?.position ?? 0;
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        emoji: config.discord.emojis.left,
        customId: "left",
        style: ButtonStyle.Primary,
        label: "Links",
        disabled: position <= 1,
      }),
      new ButtonBuilder({
        emoji: config.discord.emojis.right,
        customId: "right",
        style: ButtonStyle.Primary,
        label: "Rechts",
      }),
    );
    const embed = new EmbedBuilder()
      .setTitle("Rangfunktion")
      .setColor(0xedbc5d)
      .setThumbnail(user.avatarURL({ forceStatic: false }))
      .addFields(
        { name: "Benutzer", value: user.username, inline: false },
        { name: "Rang", value: `${position}`, inline: true },
        { name: "Exp", value: `${xpUser.experience}`, inline: true },
      );
    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }
})();

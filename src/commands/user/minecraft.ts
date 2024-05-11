import { mcnames } from "$/db/mcnames";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import { db } from "$/modules/db";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { eq } from "drizzle-orm";

export default new (class MinecraftCommand extends Command {
  public perm = permissions.user;
  public name = "minecraft";
  public setup = new SlashCommandBuilder()
    .addStringOption(
      new SlashCommandStringOption()
        .setName("name")
        .setDescription("Den Namen, den du angeben möchtest")
        .setRequired(true),
    )
    .setName("minecraft")
    .setDescription(
      "Tell the bot your minecraft name to get whitelisted on subservers",
    )
    .setDescriptionLocalization(
      "de",
      "Teile dem Bot deinen Minecraft Namen für die Subserver mit",
    )
    .toJSON();
  public async run(
    client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inCachedGuild()) return;
    const name = interaction.options.getString("name");
    const siteData = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${name}`,
    );
    if (siteData.status !== 200) {
      await interaction.reply("Dieser Name wurde nicht gefunden.");
      return;
    }
    let previous = true;
    let initialName: unknown;
    const jsonData =
      (await siteData.json()) || JSON.parse(await siteData.text());
    const [mcuser] = await db
      .select()
      .from(mcnames)
      .where(eq(mcnames.discordId, BigInt(interaction.member.user.id)));
    if (!mcuser?.mcName) {
      previous = false;
    } else {
      initialName = mcuser.mcName;
    }
    await db
      .update(mcnames)
      .set({
        mcId: jsonData.id,
        mcName: jsonData.name,
        whitelistTwitch: config.discord.roles.whitelist.twitch.some((r) =>
          interaction.member.roles.resolve(r),
        ),
        whitelistYoutube: config.discord.roles.whitelist.youtube.some((r) =>
          interaction.member.roles.cache.has(r),
        ),
      })
      .where(eq(mcnames.discordId, BigInt(interaction.member.user.id)));

    interaction.reply(
      !previous
        ? `Dein Minecraftname **${jsonData.name}** wurde erfolgreich hinzugefügt.`
        : `Du hast deinen Minecraftnamen von **${initialName}** auf **${jsonData.name}** aktualisiert.`,
    );
    client.syncWhitelist();
  }
})();

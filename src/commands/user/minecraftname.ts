import { inspect } from "node:util";
import { mcnames } from "$/db/mcnames";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

export default new (class MinecraftnameCommand extends Command {
  public perm = permissions.user;
  public name = "minecraftname";
  public setup = new SlashCommandBuilder()
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want the minecraft name from")
        .setDescriptionLocalization(
          "de",
          "Der Nutzer, dessen Minecraft Namen du wissen möchtest",
        )
        .setRequired(false),
    )
    .setName("minecraftname")
    .setDescription("Request the Minecraft name of a user")
    .setDescriptionLocalization("de", "Frage einen Minecraft Namen ab")
    .toJSON();
  public async run(
    _client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const user = interaction.options.getUser("user") || interaction.user;
    const [mcUser] = await db
      .select()
      .from(mcnames)
      .where(eq(mcnames.discordId, BigInt(user.id)));
    logger.debug(inspect(mcUser));
    if (!mcUser?.mcId) {
      await interaction.reply({
        content: "Dein Minecraft Name konnte nicht gefunden werden.",
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setColor(0xedbc5d)
      .setThumbnail(`https://crafatar.com/renders/body/${mcUser.mcId}?overlay`)
      .addFields([{ name: "Minecraft-Name", value: mcUser.mcName ?? "" }]);
    interaction.reply({ embeds: [embed] });
  }
})();

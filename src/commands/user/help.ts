import { CustomCommands } from "$/db/CustomCommands";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import { db } from "$/modules/db";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default new (class HelpCommand extends Command {
  public perm = permissions.user;
  public name = "help";
  public setup = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the currently existing commands")
    .setDescriptionLocalization(
      "de",
      "Zeigt die Hilfe an welche Befehle derzeit exestieren",
    )
    .toJSON();
  public async run(
    client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("**__Der Bot kann folgende Befehle:__**")
      .setColor(0xedbc5d)
      .addFields(
        {
          name: "/minecraft [Name]",
          value: "Registriere deinen Minecraft-Account",
        },
        {
          name: "/minecraftname [Name]",
          value: "Gibt deinen aktuellen Minecraft-Account wieder",
        },
        {
          name: "/rank [Name]",
          value: "Gibt Erfahrung wieder",
        },
        {
          name: "/ranking [Name]",
          value: "Zeigt die Aktuelle Rangliste an",
        },
        {
          name: "/anfrage",
          value:
            "Schreibe dem Bot eine Anfrage, die direkt an die Moderatoren privat weitergeleitet werden",
        },
        {
          name: "/notify",
          value:
            "Vergibt/entzieht die Benachrichtigungsrolle für Streams/Videos",
        },
      );
    if (client.user)
      embed.setThumbnail(client.user?.avatarURL({ extension: "png" }));

    const ccmds = (
      await db
        .select({ commandName: CustomCommands.commandName })
        .from(CustomCommands)
    ).map((c) => `${config.discord.prefix}${c.commandName}`);
    if (ccmds.length > 0)
      embed.addFields({
        name: "**__Temporäre Befehle:__**",
        value: ccmds.join(", "),
      });
    interaction.reply({ embeds: [embed] });
  }
})();

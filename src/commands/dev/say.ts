import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { ChannelType, SlashCommandBuilder } from "discord.js";

export default new (class SayCommand extends Command {
  public perm = permissions.dev;
  public name = "say";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("say")
    .setDescription("Send a message using the bot")
    .setDescriptionLocalization("de", "Gibt eine Nachricht über den Bot aus")
    .addStringOption((option) =>
      option
        .setName("message")
        .setNameLocalization("de", "nachricht")
        .setDescription("The message to be sent")
        .setDescriptionLocalization(
          "de",
          "Die Nachricht, die gesendet werden soll",
        )
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread)
        .setNameLocalization("de", "kanal")
        .setDescription(
          "The channel the message is sent to, defaults to the general channel",
        )
        .setDescriptionLocalization(
          "de",
          "Der Kanal in den die Nachricht geschickt wird",
        )
        .setRequired(false),
    )
    .toJSON();
  public async run(
    client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const text = interaction.options.getString("message", true);
    const channel =
      interaction.options.getChannel<
        ChannelType.GuildText | ChannelType.PublicThread
      >("channel", false) ??
      (await client.channels.fetch(config.discord.channels.standard));
    if (!channel?.isSendable()) {
      await interaction.reply(
        "Der in der konfigurierte Kanal ist kein Textkanal.",
      );
      return;
    }
    await channel.send(text);
    await interaction.reply("Die Nachricht wurde erfolgreich gesendet");
  }
})();

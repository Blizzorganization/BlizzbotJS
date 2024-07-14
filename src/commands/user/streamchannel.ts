import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder, StageChannel } from "discord.js";

export default new (class StreamchannelCommand extends Command {
  public perm = permissions.user;
  public name = "streamchannel";
  public setup = new SlashCommandBuilder()
    .setName("streamchannel")
    .setDescription("Create a Stream-Channel")
    .setDescriptionLocalization("de", "Erzeuge einen Stream-Channel")
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.member.voice.channel) {
      await interaction.reply({
        content:
          "Du musst dich in einem Sprachkanal befinden um diesen Befehl ausführen zu können.",
        ephemeral: true,
      });
      return;
    }
    const vc = interaction.member.voice.channel;
    if (!vc.parentId || config.discord.channels.voiceCategory !== vc.parentId) {
      await interaction.reply({
        content:
          "Um einen Streamchannel zu erzeugen musst du dich in einem Standard Voicechannel befinden.",
        ephemeral: true,
      });
      return;
    }
    if (vc instanceof StageChannel) {
      await interaction.reply({
        content:
          "Du musst dich für diesen Befehl in einem Sprachkanal, nicht in einem Stage Kanal befinden.",
        ephemeral: true,
      });
      return;
    }
    const streamchannel = await vc.clone();
    await streamchannel.setName("Stream-Channel");
    await interaction.member.voice.setChannel(streamchannel);
    interaction.reply({
      content: "Ein Streamchannel wurde erzeugt.",
      ephemeral: true,
    });
  }
})();

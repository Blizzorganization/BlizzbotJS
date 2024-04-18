import { SlashCommandBuilder } from "discord.js";
import { GuildMember, StageChannel } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
  if (!interaction.member.voice) {
    return interaction.reply({
      content:
        "Du musst dich in einem Sprachkanal befinden um diesen Befehl ausführen zu können.",
      ephemeral: true,
    });
  }
  const vc = interaction.member.voice.channel;
  if (!client.config.channels.voiceCategory.includes(vc.parentId)) {
    return interaction.reply({
      content:
        "Um einen Streamchannel zu erzeugen musst du dich in einem Standard Voicechannel befinden.",
      ephemeral: true,
    });
  }
  if (vc instanceof StageChannel) {
    return interaction.reply({
      content:
        "Du musst dich für diesen Befehl in einem Sprachkanal, nicht in einem Stage Kanal befinden.",
      ephemeral: true,
    });
  }
  const streamchannel = await vc.clone();
  await streamchannel.setName("Stream-Channel");
  let member = interaction.member;
  if (!(member instanceof GuildMember))
    member = await interaction.guild.members.fetch(member.user.id);
  await interaction.member.voice.setChannel(streamchannel);
  interaction.reply({
    content: "Ein Streamchannel wurde erzeugt.",
    ephemeral: true,
  });
}

const setup = new SlashCommandBuilder()
  .setName("streamchannel")
  .setDescription("Create a Stream-Channel")
  .setDescriptionLocalization("de", "Erzeuge einen Stream-Channel")
  .toJSON();

export { perm, run, setup };

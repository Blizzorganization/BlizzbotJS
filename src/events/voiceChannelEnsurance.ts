import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import logger from "$/modules/logger";
import type {
  CategoryChannel,
  Collection,
  Guild,
  GuildMember,
  OverwriteResolvable,
  Snowflake,
  VoiceBasedChannel,
  VoiceState,
} from "discord.js";
import { ChannelType, Events, OverwriteType } from "discord.js";

export default new (class VoiceChannelEnsuranceHandler extends EventListener<Events.VoiceStateUpdate> {
  public eventName = Events.VoiceStateUpdate as const;
  async handle(
    _client: DiscordClient,
    _oldState: VoiceState,
    newState: VoiceState,
  ): Promise<void> {
    const voicechannels: Collection<Snowflake, VoiceBasedChannel> =
      newState.guild.channels.cache.filter((c): c is VoiceBasedChannel => {
        // only voice channels
        if (!c.isVoiceBased()) return false;
        // only channels with a name starting with "Channel "
        if (!c.name.startsWith("Channel ")) return false;
        // only channels that are in a Voice Channel Category
        if (!c.parent || config.discord.channels.voiceCategory !== c.parentId)
          return false;
        return true;
      });
    const emptyVCs = voicechannels.filter((c) => c.members.size === 0);
    const vc = voicechannels.first();
    await this.ensureEmptyVC(emptyVCs, vc, voicechannels);
    await this.deleteExtraEmptyVCs(emptyVCs);
    await this.clearEmptyStreamChannels(newState);
    const textVoiceCategory = this.findTextVoiceCategory(newState.guild);
    if (!textVoiceCategory) return;
    await this.clearTextVoiceChannels(textVoiceCategory, voicechannels);
    if (!newState.channel?.name.startsWith("Channel ")) return;
    const vcId = Number.parseInt(newState.channel.name.replace("Channel ", ""));
    const textVoice = textVoiceCategory.children.cache.find(
      (c) => c.name === `text-voice-${vcId}`,
    );
    if (!textVoice) {
      logger.info(`Creating Text voice channel for Channel ${vcId}`);
      await this.createTextVoice(textVoiceCategory, vcId, [
        ...this.basePermissionOverwrites(newState.guild.id),
        ...newState.channel.members.map(this.createMemberPermissions),
      ]);
    } else {
      if (
        newState.member &&
        !textVoice.permissionOverwrites.cache.some(
          (po) =>
            po.type === OverwriteType.Member && po.id === newState.member?.id,
        )
      ) {
        await textVoice.permissionOverwrites.create(newState.member, {
          ViewChannel: true,
        });
      }
    }
  }

  private findTextVoiceCategory(guild: Guild): CategoryChannel | undefined {
    const channel = guild.channels.resolve(
      config.discord.channels.textVoiceCategory,
    );
    if (channel && channel.type === ChannelType.GuildCategory) return channel;
  }

  private async clearTextVoiceChannels(
    textVoiceCategory: CategoryChannel,
    voicechannels: Collection<string, VoiceBasedChannel>,
  ) {
    for (const [
      _cid,
      textVoiceChannnel,
    ] of textVoiceCategory.children.cache.filter(
      (c) => c.name.startsWith("text-voice-") && c.isTextBased(),
    )) {
      const textVoiceIndex = Number.parseInt(
        textVoiceChannnel.name.replace("text-voice-", ""),
      );
      if (Number.isNaN(textVoiceIndex)) {
        logger.warn(
          `found text-voice-channel with a non-numeric index: ${textVoiceChannnel.name}`,
        );
        continue;
      }
      const voiceChannel = voicechannels.find(
        (vc) => vc.name === `Channel ${textVoiceIndex}`,
      );
      if (!voiceChannel || voiceChannel.members.size === 0)
        await textVoiceChannnel.delete();
    }
  }

  private async clearEmptyStreamChannels(newState: VoiceState) {
    for (const [_id, channel] of newState.guild.channels.cache) {
      // only voice channels
      if (!channel.isVoiceBased()) continue;
      // only channels with the name "Channel"
      if (channel.name !== "Stream-Channel") continue;
      // only channels that are in a Voice Channel Category
      if (
        !channel.parentId ||
        !config.discord.channels.voiceCategory.includes(channel.parentId)
      )
        continue;
      // we only care about empty channels
      if (channel.members.size > 0) continue;
      await channel.delete();
    }
  }

  private async deleteExtraEmptyVCs(
    emptyVCs: Collection<string, VoiceBasedChannel>,
  ) {
    while (emptyVCs.size > 1) {
      // biome-ignore lint/style/noNonNullAssertion: there is at least one as checked above.
      const vc = emptyVCs.last()!;
      const vcIdx = Number.parseInt(vc.name.replace("Channel ", ""));
      const textVoice = vc.guild.channels.cache.find(
        (c) =>
          config.discord.channels.textVoiceCategory === c.parentId &&
          c.name === `text-voice-${vcIdx}`,
      );
      await vc.delete();
      await textVoice?.delete();
      emptyVCs.delete(vc.id);
      logger.debug("Deleting extra empty voice channels");
    }
  }
  createMemberPermissions(member: GuildMember): OverwriteResolvable {
    return {
      type: OverwriteType.Member,
      id: member.id,
      allow: "ViewChannel",
    };
  }
  basePermissionOverwrites(guildId: Snowflake): OverwriteResolvable[] {
    return [
      {
        type: OverwriteType.Role,
        id: guildId,
        deny: "ViewChannel",
      },
      {
        type: OverwriteType.Role,
        id: config.discord.roles.mod,
        allow: "ViewChannel",
      },
    ];
  }
  async createTextVoice(
    parent: CategoryChannel,
    num: number,
    permissionOverwrites: OverwriteResolvable[],
  ) {
    const textVoice = await parent.children.create({
      name: `text-voice-${num}`,
      type: ChannelType.GuildText,
      permissionOverwrites,
    });
    return textVoice;
  }
  async ensureEmptyVC(
    emptyVCs: Collection<string, VoiceBasedChannel>,
    vc: VoiceBasedChannel | undefined,
    voicechannels: Collection<string, VoiceBasedChannel>,
  ) {
    if (emptyVCs.size > 0) return;

    if (!vc) {
      logger.error("There is no voice channel starting with 'Channel'.");
      return;
    }
    const existingNums = voicechannels.map((channel) =>
      Number.parseInt(channel.name.replace("Channel ", "")),
    );
    let num = 1;
    while (existingNums.includes(num)) num++;
    await vc.clone({ name: `Channel ${num}`, position: num });
    logger.debug("Created new Voice channel as all existing ones are in use.");
  }
})();

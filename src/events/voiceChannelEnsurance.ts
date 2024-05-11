import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import logger from "$/modules/logger";
import type {
  Collection,
  OverwriteResolvable,
  Snowflake,
  VoiceBasedChannel,
  VoiceState,
} from "discord.js";
import { ChannelType, Events, OverwriteType, VoiceChannel } from "discord.js";

export default new (class VoiceChannelEnsuranceHandler extends EventListener<Events.VoiceStateUpdate> {
  public eventName = Events.VoiceStateUpdate as const;
  async handle(
    client: DiscordClient,
    oldState: VoiceState,
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
    if (emptyVCs.size === 0) {
      if (!vc) {
        logger.error("There is no voice channel starting with 'Channel'.");
        return;
      }
      const existingNums = voicechannels.map((channel) =>
        Number.parseInt(channel.name.replace("Channel ", "")),
      );
      let num = 1;
      while (existingNums.includes(num)) num++;
      await vc.clone({
        name: `Channel ${num}`,
        position: num,
      });
      logger.silly("Creating new Voice channel as all old ones are used up.");
    }
    while (emptyVCs.size > 1) {
      // biome-ignore lint/style/noNonNullAssertion: there is at least one as checked above.
      const vc = emptyVCs.last()!;
      const vcId = Number.parseInt(vc.name.replace("Channel ", ""));
      const textVoice = vc.guild.channels.cache.find(
        (c) =>
          config.discord.channels.textVoiceCategory === c.parentId &&
          c.name === `text-voice-${vcId}`,
      );
      await vc.delete();
      await textVoice?.delete();
      emptyVCs.delete(vc.id);
      logger.silly("Deleting extra empty voice channels");
    }
    if (emptyVCs.size > 0) {
      // biome-ignore lint/style/noNonNullAssertion: check above
      const lastVC = emptyVCs.first()!;
      lastVC.guild.channels.cache
        .find(
          (c) =>
            config.discord.channels.textVoiceCategory === c.parentId &&
            c.name === `text-voice-${lastVC.name.replace("Channel ", "")}`,
        )
        ?.delete();
    }
    const streamchannels = newState.guild.channels.cache.filter((c) => {
      // only voice channels
      if (!(c instanceof VoiceChannel)) return false;
      // only channels with the name "Channel"
      if (c.name !== "Stream-Channel") return false;
      // only channels that are in a Voice Channel Category
      if (
        !c.parentId ||
        !config.discord.channels.voiceCategory.includes(c.parentId)
      )
        return false;
      // we only care about empty channels
      if (c.members.size > 0) return false;
      return true;
    });
    if (streamchannels.size > 0) {
      for (const [_, channel] of streamchannels) channel.delete();
    }

    if (oldState.channel?.name.startsWith("Channel ")) {
      const vc = oldState.channel.name;
      const vcId = Number.parseInt(vc.replace("Channel ", ""));
      const textVoice = oldState.guild.channels.cache.find(
        (c) => c.name === `text-voice-${vcId}`,
      );
      if (!textVoice) {
        logger.warn(
          `There is a missing Text voice channel for Channel ${vcId}`,
        );
        return;
      }
      if (!textVoice.isTextBased()) return;
      if (textVoice.isThread()) return;
      if (!oldState.member) return;
      textVoice.permissionOverwrites.delete(oldState.member);
    }

    if (!newState.channel) return;
    if (!newState.channel.name.startsWith("Channel ")) return;
    const vcName = newState.channel.name;
    const vcId = Number.parseInt(vcName.replace("Channel ", ""));
    let textVoice = newState.guild.channels.cache.find(
      (c) => c.name === `text-voice-${vcId}`,
    );
    if (!textVoice) {
      textVoice = await createTextVoice(client, newState, vcId);
    }
    if (!textVoice) return;
    if (textVoice.isThread()) return;
    if (!newState.member) return;
    textVoice.permissionOverwrites.create(newState.member, {
      ViewChannel: true,
    });
  }
})();

async function createTextVoice(
  _client: DiscordClient,
  member: VoiceState,
  num: number,
) {
  const vc = member.channel;
  if (!vc) return;
  const permissionOverwrites: OverwriteResolvable[] = [
    {
      type: OverwriteType.Role,
      id: vc.guild.id,
      deny: "ViewChannel",
    },
    {
      type: OverwriteType.Role,
      id: config.discord.roles.mod,
      allow: "ViewChannel",
    },
  ];
  for (const [memberId, _member] of vc.members) {
    permissionOverwrites.push({
      type: OverwriteType.Member,
      id: memberId,
      allow: "ViewChannel",
    });
  }
  return await vc.guild.channels.create({
    name: `text-voice-${num}`,
    type: ChannelType.GuildText,
    parent: config.discord.channels.textVoiceCategory,
    permissionOverwrites,
  });
}

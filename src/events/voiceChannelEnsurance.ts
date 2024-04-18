import { Collection, Snowflake, VoiceChannel, VoiceState } from "discord.js";
import logger from "../modules/logger";
import DiscordClient from "../modules/DiscordClient";
import { discord as discordConfig } from "../modules/config";

const disabled = false;
const name = "voiceStateUpdate";

async function handle(
  client: DiscordClient,
  oldMember: VoiceState,
  newMember: VoiceState,
) {
  const voicechannels: Collection<Snowflake, VoiceChannel> =
    newMember.guild.channels.cache.filter((c) => {
      // only voice channels
      if (!(c instanceof VoiceChannel)) return false;
      // only channels with a name starting with "Channel "
      if (!c.name.startsWith("Channel ")) return false;
      // only channels that are in a Voice Channel Category
      if (!c.parent || discordConfig.channels.voiceCategory !== c.parentId)
        return false;
      return true;
    });
  const emptyVCs = voicechannels.filter((c) => c.members.size === 0);
  if (emptyVCs.size === 0) {
    const existingNums = voicechannels.map((channel) =>
      parseInt(channel.name.replace("Channel ", "")),
    );
    let num = 1;
    while (existingNums.includes(num)) num++;
    const vc = voicechannels.first();
    await vc.clone({
      name: `Channel ${num}`,
      position: num,
    });
    logger.silly("Creating new Voice channel as all old ones are used up.");
  }
  while (emptyVCs.size > 1) {
    const vc = emptyVCs.last();
    const vcId = parseInt(vc.name.replace("Channel ", ""));
    const textVoice = vc.guild.channels.cache.find(
      (c) =>
        discordConfig.channels.textVoiceCategory === c.parentId &&
        c.name === `text-voice-${vcId}`,
    );
    await vc.delete();
    await textVoice?.delete();
    emptyVCs.delete(vc.id);
    logger.silly("Deleting extra empty voice channels");
  }
  if (emptyVCs.size > 0) {
    const lastVC = emptyVCs.first();
    lastVC.guild.channels.cache
      .find(
        (c) =>
          discordConfig.channels.textVoiceCategory === c.parentId &&
          c.name === `text-voice-${lastVC.name.replace("Channel ", "")}`,
      )
      ?.delete();
  }
  const streamchannels = newMember.guild.channels.cache.filter((c) => {
    // only voice channels
    if (!(c instanceof VoiceChannel)) return false;
    // only channels with the name "Channel"
    if (c.name !== "Stream-Channel") return false;
    // only channels that are in a Voice Channel Category
    if (!c.parent || !discordConfig.channels.voiceCategory.includes(c.parentId))
      return false;
    // we only care about empty channels
    if (c.members.size > 0) return false;
    return true;
  });
  if (streamchannels.size > 0) streamchannels.forEach((c) => c.delete());

  if (oldMember.channel) {
    if (oldMember.channel.name.startsWith("Channel ")) {
      const vc = oldMember.channel.name;
      const vcId = parseInt(vc.replace("Channel ", ""));
      const textVoice = oldMember.guild.channels.cache.find(
        (c) => c.name === `text-voice-${vcId}`,
      );
      if (!textVoice) {
        logger.warn(
          `There is a missing Text voice channel for Channel ${vcId}`,
        );
        return;
      }
      if (textVoice.type !== "GUILD_TEXT") return;
      textVoice.permissionOverwrites.delete(oldMember.member);
    }
  }

  if (newMember.channel) {
    if (newMember.channel.name.startsWith("Channel ")) {
      const vc = newMember.channel.name;
      const vcId = parseInt(vc.replace("Channel ", ""));
      let textVoice = newMember.guild.channels.cache.find(
        (c) => c.name === `text-voice-${vcId}`,
      );
      if (!textVoice) {
        textVoice = await createTextVoice(client, newMember, vcId);
      }
      if (textVoice.type !== "GUILD_TEXT") return;
      textVoice.permissionOverwrites.create(newMember.member, {
        VIEW_CHANNEL: true,
      });
    }
  }
}

export { handle, name, disabled };
/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").VoiceState} member
 * @param  {number} num
 */
async function createTextVoice(
  client: import("../modules/DiscordClient").default,
  member: import("discord.js").VoiceState,
  num: number,
) {
  const vc = member.channel;
  const permissionOverwrites = [
    {
      type: "role",
      id: vc.guild.id,
      deny: "VIEW_CHANNEL",
    },
    {
      type: "role",
      id: client.config.roles.mod,
      allow: "VIEW_CHANNEL",
    },
  ];
  vc.members.forEach((mem) => {
    permissionOverwrites.push({
      type: "member",
      id: mem.id,
      allow: "VIEW_CHANNEL",
    });
  });
  return await vc.guild.channels.create(`text-voice-${num}`, {
    type: "GUILD_TEXT",
    parent: client.config.channels.textVoiceCategory,
    permissionOverwrites,
  });
}

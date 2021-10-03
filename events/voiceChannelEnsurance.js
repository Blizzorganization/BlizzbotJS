import { VoiceChannel } from "discord.js";
import logger from "../modules/logger.js";

const disabled = false;
const name = "voiceStateUpdate";
/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").VoiceState} oldMember
 * @param  {import("discord.js").VoiceState} newMember
 */
async function handle(client, oldMember, newMember) {
    const voicechannels = newMember.guild.channels.cache.filter((c) => {
        // only voice channels
        if (!(c instanceof VoiceChannel)) return false;
        // only channels with the name "Channel"
        if (c.name !== "Channel") return false;
        // only channels that are in a Voice Channel Category
        if (!c.parent || !client.config.channels.voiceCategory.includes(c.parentId)) return false;
        return true;
    });
    const emptyVCs = voicechannels.filter((c) => c.members.size === 0);
    if (emptyVCs.size == 0) {
        const vc = voicechannels.first();
        vc.clone();
        logger.info("Creating new Voice channel as all old ones are used up.");
    }
    while (emptyVCs.size > 1) {
        const vc = emptyVCs.last();
        await vc.delete();
        emptyVCs.delete(vc.id);
        logger.info("Deleting extra empty voice channels");
    }
    const streamchannels = newMember.guild.channels.cache.filter((c) => {
        // only voice channels
        if (!(c instanceof VoiceChannel)) return false;
        // only channels with the name "Channel"
        if (c.name !== "Stream-Channel") return false;
        // only channels that are in a Voice Channel Category
        if (!c.parent || !client.config.channels.voiceCategory.includes(c.parentId)) return false;
        // we only care about empty channels
        if (c.members.size > 0) return false;
        return true;
    });
    if (streamchannels.size > 0) streamchannels.forEach((c) => c.delete());
}

export {
    handle,
    name,
    disabled,
};
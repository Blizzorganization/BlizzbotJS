import { permissions } from "../../modules/utils.js";

const aliases = [];
const perm = permissions.user;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message) {
    if (!message.member.voice) {
        return message.channel.send("Du musst dich in einem Sprachkanal befinden um diesen Befehl ausführen zu können.");
    }
    const vc = message.member.voice.channel;
    if (!client.config.channels.voiceCategory.includes(vc.parentId)) {
        return message.channel.send("Um einen Streamchannel zu erzeugen musst du dich in einem Standard Voicechannel befinden.");
    }
    const streamchannel = await vc.clone();
    await streamchannel.setName("Stream-Channel");
    await message.member.voice.setChannel(streamchannel);
}

export { aliases, perm, run };
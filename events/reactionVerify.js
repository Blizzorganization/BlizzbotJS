/**
 * @param  {import("../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").MessageReaction} reaction
 * @param  {import("discord.js").User} user
 */
export async function handle(client, reaction, user) {
    if (reaction.message.channelId !== client.config.channels.verificate) return;
    const guild = reaction.message.guild;
    let member = guild.members.resolve(user);
    if (!member) member = await guild.members.fetch(user.id);
}
export const disabled = false;
export const name = "messageReactionAdd";
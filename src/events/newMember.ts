/**
 * @param  {import("../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").GuildMember} member
 */
export async function handle(client, member) {
  member.send({
    content: `Willkommen auf Blizzor's Community Server.
        Damit du auf dem Server freigeschalten wirst, musst du den Befehl ${client.config.prefix}zz verwenden.
        Bitte gib diesen Befehl im Channel #freischalten ein.`,
  });
}
export const disabled = false;
export const name = "guildMemberAdd";

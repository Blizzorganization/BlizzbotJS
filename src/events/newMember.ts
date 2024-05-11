import type DiscordClient from "$/modules/DiscordClient";
import config from "$/modules/config";
import type { GuildMember } from "discord.js";

export async function handle(_client: DiscordClient, member: GuildMember) {
  member.send({
    content: `Willkommen auf Blizzor's Community Server.
Damit du auf dem Server freigeschalten wirst, musst du den Befehl ${config.discord.prefix}zz verwenden.
Bitte gib diesen Befehl im Channel #freischalten ein.`,
  });
}
export const disabled = false;
export const name = "guildMemberAdd";

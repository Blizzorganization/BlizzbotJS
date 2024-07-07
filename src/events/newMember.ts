import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import { Events, type GuildMember } from "discord.js";

export default new (class NewMemberHandler extends EventListener<Events.GuildMemberAdd> {
  public eventName = Events.GuildMemberAdd as const;
  async handle(_client: DiscordClient, member: GuildMember) {
    member.send({
      content: `Willkommen auf Blizzor's Community Server.
Damit du auf dem Server freigeschalten wirst, musst du den Befehl ${config.discord.prefix}zz verwenden.
Bitte gib diesen Befehl im Channel #freischalten ein.`,
    });
  }
})();

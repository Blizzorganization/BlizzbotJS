import { mcnames } from "$/db/mcnames";
import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import type { GuildMember, PartialGuildMember } from "discord.js";
import { Events } from "discord.js";
import { eq } from "drizzle-orm";

export default new (class RefreshWhitelistHandler extends EventListener<Events.GuildMemberUpdate> {
  public eventName = Events.GuildMemberUpdate as const;
  async handle(
    _client: DiscordClient<boolean>,
    _oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ): Promise<void> {
    const whitelistYoutube = config.discord.roles.whitelist.youtube.some(
      (role) => newMember.roles.resolve(role),
    );
    const whitelistTwitch = config.discord.roles.whitelist.twitch.some((role) =>
      newMember.roles.resolve(role),
    );
    const [mcUser] = await db
      .select()
      .from(mcnames)
      .where(eq(mcnames.discordId, BigInt(newMember.user.id)));
    if (!mcUser) return;
    const shouldUpdate =
      whitelistTwitch !== mcUser.whitelistTwitch ||
      whitelistYoutube !== mcUser.whitelistYoutube;
    if (!shouldUpdate) return;
    logger.info(
      `Updating whitelist status for user ${newMember.displayName} (${
        newMember.user.id
      }):\n\tyoutube: ${whitelistYoutube ? "yes" : "no"}\n\ttwitch: ${
        whitelistTwitch ? "yes" : "no"
      }`,
    );
    await db
      .update(mcnames)
      .set({ whitelistTwitch, whitelistYoutube })
      .where(eq(mcnames.id, mcUser.id));
  }
})();

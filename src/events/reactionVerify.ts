import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import { verify } from "$/modules/utils";
import type {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { Events } from "discord.js";

export default new (class ReactionVerifyHandler extends EventListener<Events.MessageReactionAdd> {
  public eventName = Events.MessageReactionAdd as const;
  async handle(
    client: DiscordClient,
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ): Promise<void> {
    if (!reaction.message.inGuild()) return;
    if (reaction.message.channelId !== config.discord.channels.verificate)
      return;
    const guild = reaction.message.guild;
    let member = guild.members.resolve(user.id);
    if (!member) member = await guild.members.fetch(user.id);
    member.roles.add(config.discord.roles.verify);
    await verify(client, user.username ?? user.displayName);
  }
})();

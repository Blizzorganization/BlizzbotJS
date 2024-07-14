import { Aliases } from "$/db/Aliases";
import { CustomCommands } from "$/db/CustomCommands";
import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import { db } from "$/modules/db";
import logger from "$/modules/logger";
import { verify } from "$/modules/utils";
import type { GuildMember, Message } from "discord.js";
import { Events } from "discord.js";
import { and, eq, sql } from "drizzle-orm";

const linkRegex =
  /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/gim;

export default new (class MessageHandler extends EventListener<Events.MessageCreate> {
  public eventName = Events.MessageCreate as const;
  async handle(
    client: DiscordClient,
    message: Message<boolean>,
  ): Promise<void> {
    logger.debug("message received");
    if (!message) return;
    logger.debug("message exists");
    const resolvedMessage = message.partial ? await message.fetch() : message;
    logger.debug("fetched possible partial message");
    if (config.discord.channels.ignore.includes(resolvedMessage.channelId))
      return;
    if (!resolvedMessage.inGuild()) return;
    if (await checkMessage(client, resolvedMessage)) return;
    logger.debug("message was clean.");
    if (Math.random() > 0.999)
      resolvedMessage.react(config.discord.emojis.randomReaction);
    logger.debug("checking for verification");
    if (resolvedMessage.channelId === config.discord.channels.verificate) {
      if (
        resolvedMessage.content.toLowerCase() === `${config.discord.prefix}zz`
      ) {
        logger.debug("verifying user..");
        resolvedMessage.member?.roles.add(config.discord.roles.verify);
        await verify(client, resolvedMessage.author.username);
      }
      if (resolvedMessage.deletable) resolvedMessage.delete();
      return;
    }
    if (
      config.discord.channels.commands.includes(resolvedMessage.channelId) ||
      (await handleCommands(client, resolvedMessage))
    )
      return;

    if (resolvedMessage.author.bot) return;
    calculateExperience(resolvedMessage);
  }
})();

async function handleCommands(
  _client: DiscordClient,
  message: Message<true>,
): Promise<boolean> {
  if (!message.content.startsWith(config.discord.prefix)) return false;
  const args = message.content.split(/ +/g);
  const command = (args.shift() ?? "")
    .toLowerCase()
    .slice(config.discord.prefix.length);

  const [ccmd] = await db
    .select({ response: CustomCommands.response })
    .from(CustomCommands)
    .where(eq(CustomCommands.commandName, command));
  if (ccmd) {
    await message.channel.send(ccmd.response);
    return true;
  }
  const [alias] = await db
    .select({
      alias: Aliases.name,
      command: CustomCommands.commandName,
      response: CustomCommands.response,
      commandId: CustomCommands.id,
      aliasId: Aliases.id,
    })
    .from(Aliases)
    .where(eq(Aliases.name, command))
    .innerJoin(CustomCommands, eq(Aliases.command, CustomCommands.commandName));
  if (!alias) return false;
  await message.channel.send(alias.response);
  return true;
}

async function unverify(member: GuildMember) {
  await member.roles.remove(config.discord.roles.verify);
}

export async function checkMessage(
  client: DiscordClient,
  message: Message<true>,
): Promise<boolean> {
  if (message.author.id === client.user?.id) return false;
  if (
    message.member?.roles?.cache
      .map((r) => r.id)
      .some((r) => config.discord.roles.noFilter.includes(r))
  )
    return false;
  let links = [...message.content.matchAll(linkRegex)];
  if (message.channel.id === config.discord.channels.clips)
    links = links.filter(
      (l) =>
        !l
          .toString()
          .replace(/^(http|https):\/\//, "")
          .startsWith("clips.twitch.tv"),
    );
  if (links.length > 0) {
    if (message.deletable) message.delete();
    let previousLinks = client.linkUsage.get(message.author.id) ?? [];
    previousLinks = previousLinks.filter(
      (link) => message.createdAt.getTime() - link.ts < 5000,
    );
    const newLinks = previousLinks;
    let shouldUnverify = false;
    for (const link of links) {
      if (previousLinks.some((previousLink) => previousLink.url === link))
        shouldUnverify = true;
      newLinks.push({ ts: message.createdAt.getTime(), url: link });
    }
    if (
      shouldUnverify &&
      message.member?.roles.cache.has(config.discord.roles.verify)
    )
      await unverify(message.member);
    return true;
  }
  if (client.blacklist.length === 0) return false;
  const lowerMessage = message.content.toLowerCase();
  if (client.blacklist.some((blword) => lowerMessage.indexOf(blword) !== -1)) {
    if (message.deletable) {
      await Promise.all([
        message
          .delete()
          .catch((e) =>
            logger.error(`Received an error deleting a message:\n${e.stack}`),
          ),
        message.author
          .createDM()
          .then((dmChannel) =>
            dmChannel.send(
              `Ihre Nachricht mit dem Inhalt **${message.content.slice(
                0,
                1900,
              )}** wurde entfernt. Melden Sie sich bei Fragen an einen Moderator.`,
            ),
          ),
      ]);
    }
    return true;
  }
  return false;
}

async function calculateExperience(message: Message<true>) {
  const [xpuser] = await db
    .select()
    .from(ranking)
    .where(
      and(
        eq(ranking.discordId, BigInt(message.author.id)),
        eq(ranking.guildId, BigInt(message.guildId)),
      ),
    );
  const exp = Math.min(10, Math.floor((message.content.length - 2) / 5));
  if (xpuser) {
    await db
      .update(ranking)
      .set({
        available: true,
        experience: sql`${ranking.experience} + ${exp}`,
        username: message.author.username,
      })
      .where(
        and(
          eq(ranking.discordId, xpuser.discordId),
          eq(ranking.guildId, xpuser.guildId),
        ),
      );
  } else {
    await db.insert(ranking).values({
      available: true,
      experience: exp,
      username: message.author.username,
      discordId: BigInt(message.author.id),
      guildId: BigInt(message.guildId),
    });
  }
}

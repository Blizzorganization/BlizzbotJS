import { Console } from "node:console";
import { existsSync, readdirSync, statSync } from "node:fs";
import { PassThrough } from "node:stream";
import { URL } from "node:url";
import { mcnames } from "$/db/mcnames";
import {
  type Collection,
  type Message,
  SnowflakeUtil,
  type User,
} from "discord.js";
import { sql } from "drizzle-orm";
import type DiscordClient from "./DiscordClient";
import { EventListener } from "./EventListener";
import { Command } from "./command";
import config from "./config";
import { db } from "./db";
import logger from "./logger";

/**
 * @param commandDir the command directory
 * @param commandMap the map to store */
async function loadCommands(
  commandDir: URL,
  commandMap: Collection<string, Command>,
) {
  if (!existsSync(commandDir))
    throw new Error(
      `The given command directory ${commandDir} does not exist.`,
    );
  const commandFiles = readdirSync(commandDir);
  for (const fileName of commandFiles) {
    const path = `${commandDir.href}/${fileName}`;
    if (!(fileName.endsWith(".js") || fileName.endsWith(".ts"))) {
      const stat = statSync(new URL(path));
      if (!stat.isDirectory()) {
        logger.warning(
          `${path} is not a javascript or typescript file and does not belong in the event directory`,
        );
      }
      continue;
    }
    logger.debug(`reading command file at ${commandDir}/${fileName}`);
    const cmd = (await import(path)).default as unknown;
    if (!cmd || !(cmd instanceof Command)) {
      logger.warning(`File ${path} is not a Command.`);
      continue;
    }
    const name = fileName.split(".")[0];
    if (!name) {
      logger.warning("JS File in command directory that does not have a name.");
      continue;
    }
    if (name !== cmd.name) {
      logger.error(
        `Command ${cmd.name} does not match path ${path} and will not be loaded.`,
      );
      continue;
    }
    if (cmd.disabled) {
      logger.warning(`Loading command ${name} which is disabled.`);
    }
    commandMap.set(name, cmd);
  }
}

async function checkWhitelist(_client: DiscordClient, message: Message) {
  if (!message.inGuild()) return;
  const guild = message.guild;
  const members = await guild.members.fetch();
  const ytroles = config.discord.roles.whitelist.youtube;
  const twroles = config.discord.roles.whitelist.twitch;
  await db
    .insert(mcnames)
    .values(
      members.map((member) => ({
        discordId: BigInt(member.id),
        whitelistYoutube: member.roles.cache.hasAny(...ytroles),
        whitelistTwitch: member.roles.cache.hasAny(...twroles),
      })),
    )
    .onConflictDoUpdate({
      target: mcnames.discordId,
      set: {
        whitelistTwitch: sql`excluded.${mcnames.whitelistTwitch}`,
        whitelistYoutube: sql`excluded.${mcnames.whitelistYoutube}`,
      },
    });
}

async function loadEvents(listener: DiscordClient, directory: URL) {
  const eventFiles = readdirSync(directory);
  for (const file of eventFiles) {
    const path = `${directory.href}/${file}`;
    if (!(file.endsWith(".js") || file.endsWith(".ts"))) {
      logger.warning(
        `${path} is not a javascript or typescript file and does not belong in the event directory`,
      );
      continue;
    }
    const event = (await import(path)).default;
    if (!event || !(event instanceof EventListener)) continue;
    if (event.disabled) {
      logger.info(`Event ${path} is disabled.`);
      continue;
    }
    if (event.once) {
      listener.once(event.eventName, event.handle.bind(event, listener));
    } else {
      listener.on(event.eventName, event.handle.bind(event, listener));
    }
  }
}

const permissions = {
  user: 0,
  twitchsub: 1,
  ytsub: 2,
  mod: 5,
  owner: 9,
  dev: 10,
};

function getUser(
  client: DiscordClient,
  message: Message,
  args: string[],
): User | undefined {
  let user: User | undefined;
  if (message.mentions.users.size > 0) user = message.mentions.users.first();
  if (!user && args && args.length > 0) {
    let name = args.join(" ");
    user = client.users.cache.find((u) => u.username === name);
    if (!user) {
      name = name.toLowerCase();
      user = client.users.cache.find((u) => u.username.toLowerCase() === name);
      if (!user) user = client.users.cache.get(name);
    }
  }
  return user;
}

const ts = new PassThrough({
  transform(chunk, _enc, cb) {
    cb(null, chunk);
  },
});
const customConsole = new Console({ stdout: ts });

/**
 * @param list
 * @returns the table as shown using console.table
 */
function createTable(list: unknown[]): string {
  customConsole.table(list);
  return ts.read() || "";
}

async function verify(client: DiscordClient, username: string): Promise<void> {
  if (!client.welcomeTexts || client.welcomeTexts.length === 0) {
    logger.debug("There are no welcome messages.");
    return;
  }
  const msg = client.welcomeTexts[
    Math.floor(Math.random() * client.welcomeTexts.length)
  ]?.replace(/Name/g, `**${username}**`);
  if (!msg) {
    logger.error("Could not select a welcome text.");
    return;
  }
  const standardChannel = client.channels.resolve(
    config.discord.channels.standard,
  );
  if (!standardChannel) {
    logger.error(
      `Configuration: standard channel does not resolve to a channel. Could not send verification message for ${username}.`,
    );
    return;
  }
  if (!standardChannel.isSendable()) {
    logger.error(
      `Configuration: standard channel is not a text based channel. Could not send verification message for ${username}.`,
    );
    return;
  }
  const nonce = SnowflakeUtil.generate();
  await standardChannel.send({
    content: msg,
    enforceNonce: true,
    nonce: nonce.toString(),
  });
}
export {
  checkWhitelist,
  createTable,
  getUser,
  loadCommands,
  loadEvents,
  permissions,
  verify,
};

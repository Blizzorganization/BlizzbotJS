import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import config from "$/modules/config";
import logger from "$/modules/logger";
import { createTable } from "$/modules/utils";
import { inspect } from "bun";
import { Events } from "discord.js";

export default new (class ReadyHandler extends EventListener<Events.ClientReady> {
  public eventName = Events.ClientReady as const;
  public once = true;
  async handle(client: DiscordClient<true>) {
    logger.info("The bot just started.");
    const verificationChannel = await client.channels
      .fetch(config.discord.channels.verificate, { cache: true })
      .catch((e) => {
        logger.error("Failed to fetch verification channel", e);
      });
    if (!verificationChannel || !verificationChannel.isTextBased()) {
      logger.warn(
        "The verificate channel supplied in the config file is not a text channel.",
      );
      return;
    }
    await verificationChannel.messages.fetch(
      config.discord.verificationMessage,
    );
    client.logChannel =
      (await client.channels
        .fetch(config.discord.channels.log, { cache: true })
        .catch((e) => {
          logger.error("Failed to fetch log channel", e);
        })) ?? undefined;
    if (!client.logChannel?.isTextBased()) {
      logger.warn(
        "The log channel supplied in the config file is not a text channel.",
      );
      return;
    }
    client.anfrageChannel =
      (await client.channels
        .fetch(config.discord.channels.anfrage, { cache: true })
        .catch((e) => {
          logger.error("Failed to fetch anfrage channel", e);
        })) ?? undefined;
    if (!client.anfrageChannel?.isTextBased()) {
      logger.warn(
        "The Anfrage channel supplied in the config file is not a text channel.",
      );
      return;
    }
    client.standardChannel =
      (await client.channels
        .fetch(config.discord.channels.standard, { cache: true })
        .catch((e) => {
          logger.error("Failed to fetch standard channel", e);
        })) ?? undefined;
    if (!client.standardChannel?.isTextBased()) {
      logger.warn(
        "The 'standard' channel supplied in the config file is not a text channel.",
      );
      return;
    }
    const slashGuild = await client.guilds
      .fetch(config.discord.slashGuild)
      .catch(() => {
        logger.warn("received an error while trying to fetch the slashGuild.");
      });
    if (!slashGuild) return;
    const slashSetup = client.slashCommands.map((cmd, name) => {
      logger.debug(`Parsing Command ${name}`);
      logger.debug(`Command setup is ${inspect(cmd.setup)}`);
      return cmd.setup;
    });
    // TODO
    // for (const [name, cmd] of client.contextCommands) slashSetup.push(cmd.setup);
    const slashCommands = await slashGuild.commands.set(slashSetup);
    logger.debug(
      `Loaded slash commands:\n${createTable(
        slashCommands.map((cmd) => ({
          Name: cmd.name,
          id: cmd.id,
          Version: cmd.version,
        })),
      )}`,
    );
  }
})();

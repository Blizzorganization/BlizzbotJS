import { existsSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { loadConfig } from "zod-config";
import { jsonAdapter } from "zod-config/json-adapter";
import envConfig from "./envConfig";
import logger from "./logger";
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

const databaseConfigSchema = z.object({
  host: z.string().default("localhost").describe("the database host"),
  port: z
    .number()
    .max(65535)
    .int()
    .default(5432)
    .describe("the port the database is listening on"),
  user: z
    .string()
    .describe("the username we want to connect to the database as"),
  database: z.string().describe("the database we want to connect to"),
  password: z
    .string()
    .describe("the password to use for authenticating to the database"),
});
const snowflakeSchema = z.string().regex(/^\d+$/);
const discordConfigSchema = z.object({
  token: z.string({
    message: "The Bot token from https://discord.com/developers/applications",
  }),
  prefix: z.string().default("!").describe("the bot's command prefix"),
  slashGuild: snowflakeSchema.describe(
    "the id of the server we want to register our commands to",
  ),
  verificationMessage: snowflakeSchema,
  channels: z.object({
    log: snowflakeSchema,
    commands: z.array(snowflakeSchema),
    ignore: z.array(snowflakeSchema),
    clips: snowflakeSchema,
    standard: snowflakeSchema,
    adminCommands: z.array(snowflakeSchema),
    modCommands: z.array(snowflakeSchema),
    anfrage: snowflakeSchema,
    verificate: snowflakeSchema,
    voiceCategory: snowflakeSchema,
    textVoiceCategory: snowflakeSchema,
  }),
  roles: z.object({
    whitelist: z.object({
      youtube: z.array(snowflakeSchema),
      twitch: z.array(snowflakeSchema),
    }),
    noFilter: z.array(snowflakeSchema),
    verify: snowflakeSchema,
    notify: snowflakeSchema,
    dev: snowflakeSchema,
    mod: snowflakeSchema,
  }),
  emojis: z.object({
    left: snowflakeSchema,
    right: snowflakeSchema,
    randomReaction: snowflakeSchema,
  }),
});
const pteroConfigSchema = z.object({
  host: z.string().url().describe("The URL of your Pterodactyl Panel instance"),
  apiKey: z.string().describe("Pterodactyl Client API Key"),
});
const defaultConfig: z.infer<typeof configSchema> = {
  discord: {
    token:
      "The Bot token. Get one from https://discord.com/developers/applications",
    prefix: "!",
    slashGuild: "1234",
    verificationMessage: "1234",
    channels: {
      log: "1234",
      commands: ["1234", "5678"],
      ignore: ["1234", "5678"],
      clips: "1234",
      standard: "1234",
      adminCommands: ["1234", "5678"],
      modCommands: ["1234", "5678"],
      anfrage: "1234",
      verificate: "1234",
      voiceCategory: "1234",
      textVoiceCategory: "1234",
    },
    roles: {
      whitelist: {
        youtube: ["1234", "5678"],
        twitch: ["1234", "5678"],
      },
      noFilter: ["1234", "5678"],
      verify: "1234",
      notify: "1234",
      dev: "1234",
      mod: "1234",
    },
    emojis: {
      left: "1234",
      right: "5678",
      randomReaction: "9012",
    },
  },
  database: {
    host: "localhost",
    port: 5432,
    user: "blizzbot",
    database: "blizzbot",
    password: "secret_database_password",
  },
  pterodactyl: {
    host: "",
    apiKey: "",
  },
};

if (!existsSync("configs/config.json")) {
  logger.error("There is no configuration file.");
  writeFileSync(
    "configs/config.json",
    JSON.stringify(defaultConfig, undefined, 4),
  );
  logger.info("Created a configuration file - please fill.");
  process.exit(1);
}

export const configSchema = z.object({
  database: databaseConfigSchema,
  discord: discordConfigSchema,
  pterodactyl: pteroConfigSchema,
});

export default await loadConfig({
  schema: configSchema,
  adapters: [
    { read: async () => envConfig, name: "env" },
    jsonAdapter({ path: "configs/config.json" }),
  ],
  onError(error) {
    for (const issue of error.issues) {
      logger.error(
        `Configuration key "${issue.path.join(".")}" was not set correctly: ${
          issue.message
        } [${issue.code}]`,
      );
    }
    process.exit(1);
  },
});

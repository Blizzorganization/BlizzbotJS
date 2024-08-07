import { parseEnv, port, z } from "znv";

const fromEnv = parseEnv(process.env, {
  DISCORD_TOKEN: z.string().optional(),
  DISCORD_PREFIX: z.string().optional(),
  DISCORD_SLASHGUILD: snowflake().optional(),
  DISCORD_VERIFICATIONMESSAGE: snowflake().optional(),
  DISCORD_CHANNELS_LOG: snowflake().optional(),
  DISCORD_CHANNELS_COMMANDS: z.array(snowflake()).optional(),
  DISCORD_CHANNELS_IGNORE: z.array(snowflake()).optional(),
  DISCORD_CHANNELS_CLIPS: snowflake().optional(),
  DISCORD_CHANNELS_STANDARD: snowflake().optional(),
  DISCORD_CHANNELS_ADMINCOMMANDS: z.array(snowflake()).optional(),
  DISCORD_CHANNELS_MODCOMMANDS: z.array(snowflake()).optional(),
  DISCORD_CHANNELS_ANFRAGE: snowflake().optional(),
  DISCORD_CHANNELS_VERIFICATE: snowflake().optional(),
  DISCORD_CHANNELS_VOICECATEGORY: snowflake().optional(),
  DISCORD_CHANNELS_TEXTVOICECATEGORY: snowflake().optional(),
  DISCORD_ROLES_WHITELIST_YOUTUBE: z.array(snowflake()).optional(),
  DISCORD_ROLES_WHITELIST_TWITCH: z.array(snowflake()).optional(),
  DISCORD_ROLES_NOFILTER: z.array(snowflake()).optional(),
  DISCORD_ROLES_VERIFY: snowflake().optional(),
  DISCORD_ROLES_NOTIFY: snowflake().optional(),
  DISCORD_ROLES_DEV: snowflake().optional(),
  DISCORD_ROLES_MOD: snowflake().optional(),
  DISCORD_ROLES_BOT: snowflake().optional(),
  DISCORD_EMOJIS_LEFT: snowflake().optional(),
  DISCORD_EMOJIS_RIGHT: snowflake().optional(),
  DISCORD_EMOJIS_RANDOMREACTION: snowflake().optional(),
  PTERODACTYL_HOST: z.string().url().optional(),
  PTERODACTYL_APIKEY: z.string().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: port().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_DATABASE: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_LOGS: z.boolean().optional(),
});
export default {
  discord: {
    token: fromEnv.DISCORD_TOKEN,
    prefix: fromEnv.DISCORD_PREFIX,
    slashGuild: fromEnv.DISCORD_SLASHGUILD,
    verificationMessage: fromEnv.DISCORD_VERIFICATIONMESSAGE,
    channels: {
      log: fromEnv.DISCORD_CHANNELS_LOG,
      commands: fromEnv.DISCORD_CHANNELS_COMMANDS,
      ignore: fromEnv.DISCORD_CHANNELS_IGNORE,
      clips: fromEnv.DISCORD_CHANNELS_CLIPS,
      standard: fromEnv.DISCORD_CHANNELS_STANDARD,
      adminCommands: fromEnv.DISCORD_CHANNELS_ADMINCOMMANDS,
      modCommands: fromEnv.DISCORD_CHANNELS_MODCOMMANDS,
      anfrage: fromEnv.DISCORD_CHANNELS_ANFRAGE,
      verificate: fromEnv.DISCORD_CHANNELS_VERIFICATE,
      voiceCategory: fromEnv.DISCORD_CHANNELS_VOICECATEGORY,
      textVoiceCategory: fromEnv.DISCORD_CHANNELS_TEXTVOICECATEGORY,
    },
    roles: {
      whitelist: {
        youtube: fromEnv.DISCORD_ROLES_WHITELIST_YOUTUBE,
        twitch: fromEnv.DISCORD_ROLES_WHITELIST_TWITCH,
      },
      noFilter: fromEnv.DISCORD_ROLES_NOFILTER,
      verify: fromEnv.DISCORD_ROLES_VERIFY,
      notify: fromEnv.DISCORD_ROLES_NOTIFY,
      dev: fromEnv.DISCORD_ROLES_DEV,
      mod: fromEnv.DISCORD_ROLES_MOD,
      bot: fromEnv.DISCORD_ROLES_BOT,
    },
    emojis: {
      left: fromEnv.DISCORD_EMOJIS_LEFT,
      right: fromEnv.DISCORD_EMOJIS_RIGHT,
      randomReaction: fromEnv.DISCORD_EMOJIS_RANDOMREACTION,
    },
  },
  pterodactyl: {
    apiKey: fromEnv.PTERODACTYL_APIKEY,
    host: fromEnv.PTERODACTYL_HOST,
  },
  database: {
    database: fromEnv.DATABASE_DATABASE,
    host: fromEnv.DATABASE_HOST,
    password: fromEnv.DATABASE_PASSWORD,
    port: fromEnv.DATABASE_PORT,
    user: fromEnv.DATABASE_USER,
  },
  logSql: fromEnv.DATABASE_LOGS,
};
function snowflake(): z.ZodString {
  return z.string().regex(/^\d+$/);
}

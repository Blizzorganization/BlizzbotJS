import { Snowflake } from "discord.js";

declare module blizzbot {
    export const discord: {
        token: string
        prefix: string
        slashGuild: Snowflake
        channels: {
            log: Snowflake
            commands: Snowflake[]
            clips: Snowflake
            standard: Snowflake
            adminCommands: Snowflake[]
            anfrage: Snowflake
            verificate: Snowflake
            voiceCategory: Snowflake
            textVoiceCategory: Snowflake
        }
        roles: {
            whitelist: {
                youtube: Snowflake[]
                twitch: Snowflake[]
            };
            noFilter: Snowflake
            verify: Snowflake
            dev: Snowflake
            mod: Snowflake
        }
        emojis: {
            left: Snowflake
            right: Snowflake
            randomReaction: `<:${string}:${Snowflake}>` | `<a:${string}:${Snowflake}>`
        }
    }
    export const database: {
        host: string
        port: number
        user: string
        database: string
        password: string
        type: string
    }
    export const pterodactyl: {
        host: string
        apiKey: string
    }
}
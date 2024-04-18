import postgres from "postgres";
import logger from "./logger.js";
import { database as config } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";

export const sql = postgres(config);
export const db = drizzle(sql);

class XPUser {
  discordId: number;
  guildId: number;
  experience: number;
  available: boolean;
  username: string;
  get level() {
    // @ts-ignore
    return Math.floor(Math.sqrt(this.experience / 10));
  }
  async getPosition() {
    return await sql`SELECT COUNT( distinct experience ) FROM "ranking" WHERE experience >= ${this.experience};`;
  }
}
interface MCUser {
  discordId: number;
  mcName: string;
  mcId: string;
  whitelistTwitch: boolean;
  whitelistYouTube: boolean;
}
interface CustomCommand {
  commandName: string;
  response: string;
  lastEditedBy: number;
}
interface Alias {
  command: string;
  name: string;
  type: string;
}

export { Alias, CustomCommand, MCUser, XPUser };

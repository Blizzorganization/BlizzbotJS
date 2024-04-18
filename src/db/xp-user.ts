import {
  bigint,
  boolean,
  integer,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const XPUser = pgTable("ranking", {
  id: integer("id").notNull().primaryKey(),
  discordId: bigint("discordId", { mode: "number" }),
  guildId: bigint("guildId", { mode: "number" }),
  experience: integer("experience"),
  available: boolean("available"),
  username: varchar("username", { length: 255 }),
});

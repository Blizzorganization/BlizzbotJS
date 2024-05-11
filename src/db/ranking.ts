import {
  bigint,
  boolean,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const ranking = pgTable("ranking", {
  id: serial("id").notNull().primaryKey(),
  discordId: bigint("discordId", { mode: "bigint" }).notNull(),
  guildId: bigint("guildId", { mode: "bigint" }).notNull(),
  experience: integer("experience").notNull().default(0),
  available: boolean("available").notNull().default(true),
  username: varchar("username", { length: 255 }).notNull(),
});

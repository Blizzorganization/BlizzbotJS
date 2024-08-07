import {
  bigint,
  boolean,
  pgTable,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const mcnames = pgTable("mcnames", {
  id: serial("id").notNull().primaryKey(),
  discordId: bigint("discordId", { mode: "bigint" }).notNull(),
  mcName: varchar("mcName", { length: 255 }),
  mcId: uuid("mcId"),
  whitelistTwitch: boolean("whitelistTwitch").default(false).notNull(),
  whitelistYoutube: boolean("whitelistYoutube").default(false).notNull(),
});

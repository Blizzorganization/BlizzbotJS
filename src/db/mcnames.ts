import { bigint, boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const mcnames = pgTable("mcnames", {
  discordId: bigint("discordId", { mode: "bigint" }).notNull(),
  mcName: varchar("mcName", { length: 255 }),
  mcId: uuid("mcId"),
  whitelistTwitch: boolean("whitelistTwitch").default(false).notNull(),
  whitelistYoutube: boolean("whitelistYoutube").default(false).notNull(),
});

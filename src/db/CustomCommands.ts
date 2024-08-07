import { bigint, pgTable, serial, text } from "drizzle-orm/pg-core";

export const CustomCommands = pgTable("CustomCommands", {
  id: serial("id").notNull().primaryKey(),
  commandName: text("commandName").notNull().unique(),
  response: text("response").notNull(),
  lastEditedBy: bigint("lastEditedBy", { mode: "bigint" }),
});

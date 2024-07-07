import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { CustomCommands } from "./CustomCommands";

export const Aliases = pgTable("Aliases", {
  id: serial("id").notNull().primaryKey(),
  command: text("command")
    .notNull()
    .references(() => CustomCommands.commandName, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
});

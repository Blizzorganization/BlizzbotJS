import { Aliases } from "$/db/Aliases";
import { CustomCommands } from "$/db/CustomCommands";
import type DiscordClient from "$/modules/DiscordClient";
import { EventListener } from "$/modules/EventListener";
import { db, sql } from "$/modules/db";
import logger from "$/modules/logger";
import type { Interaction } from "discord.js";

export default new (class AutocompleteHandler extends EventListener<"interactionCreate"> {
  public eventName = "interactionCreate" as const;
  async handle(client: DiscordClient, interaction: Interaction) {
    if (!interaction.isAutocomplete()) return;
    switch (interaction.commandName) {
      case "checkdb":
        {
          const input = interaction.options.getFocused();
          if (typeof input === "number") return;
          const tableNames = await sql<{ table_name: string }[]>`SELECT
                table_name
              FROM
                information_schema.tables
              WHERE
                table_type = 'BASE TABLE'
              AND
              table_schema NOT IN ('pg_catalog', 'information_schema');`;
          interaction.respond(
            tableNames
              .map((t) => t.table_name)
              .filter((t) => t.toLowerCase().startsWith(input.toLowerCase()))
              .map((table) => ({ name: table, value: table })),
          );
        }
        break;
      case "add":
      case "edit":
        {
          const input = interaction.options.getFocused();
          if (typeof input === "number") return;
          interaction.respond(
            (
              await db
                .select({ commandName: CustomCommands.commandName })
                .from(CustomCommands)
            )
              .map((ccmd) => ccmd.commandName)
              .filter((ccmd) =>
                ccmd.toLowerCase().startsWith(input.toLowerCase()),
              )
              .map((ccmd) => ({ name: ccmd, value: ccmd })),
          );
        }
        break;
      case "delete":
        {
          switch (interaction.options.getSubcommand(true)) {
            case "customcommand":
              {
                const input = interaction.options.getFocused();
                if (typeof input === "number") return;
                interaction.respond(
                  (
                    await db
                      .select({ commandName: CustomCommands.commandName })
                      .from(CustomCommands)
                  )
                    .map((ccmd) => ccmd.commandName)
                    .filter((ccmd) =>
                      ccmd.toLowerCase().startsWith(input.toLowerCase()),
                    )
                    .map((ccmd) => ({ name: ccmd, value: ccmd })),
                );
              }
              break;
            case "alias":
              {
                const input = interaction.options.getFocused();
                if (typeof input === "number") return;
                interaction.respond(
                  (await db.select({ name: Aliases.name }).from(Aliases))
                    .map((alias) => alias.name)
                    .filter((alias) =>
                      alias.toLowerCase().startsWith(input.toLowerCase()),
                    )
                    .map((alias) => ({ name: alias, value: alias })),
                );
              }
              break;
            case "blacklist":
              {
                const input = interaction.options.getFocused();
                if (typeof input === "number") return;
                interaction.respond(
                  client.blacklist
                    .filter((blword) =>
                      blword.toLowerCase().startsWith(input.toLowerCase()),
                    )
                    .map((blword) => ({ name: blword, value: blword })),
                );
              }
              break;
          }
        }
        break;
      default:
        logger.error(
          `unknown command while trying to autocomplete: ${interaction.commandName}`,
        );
        break;
    }
  }
})();

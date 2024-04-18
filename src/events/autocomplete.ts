import { Events, Interaction } from "discord.js";
import { EventListener } from "../modules/EventListener.js";
import { sql } from "../modules/db";
import logger from "../modules/logger";

export default class AutocompleteHandler extends EventListener<Events.InteractionCreate> {
  public eventName: Events.InteractionCreate;
  async handle(interaction: Interaction) {
    if (!interaction.isAutocomplete()) return;
    switch (interaction.commandName) {
      case "checkdb":
        {
          const input = interaction.options.getFocused();
          if (typeof input == "number") return;
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
          if (typeof input == "number") return;
          interaction.respond(
            (await CustomCommand.findAll())
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
                  (await CustomCommand.findAll())
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
                  (await Alias.findAll())
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
}

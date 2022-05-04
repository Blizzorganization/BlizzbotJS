import { Alias, CustomCommand, db } from "../modules/db.js";
import logger from "../modules/logger.js";

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Interaction} interaction
 */
export async function handle(client, interaction) {
    if (!interaction.isAutocomplete()) return;
    switch (interaction.commandName) {
        case "checkdb":
            {
                const input = interaction.options.getFocused();
                if (typeof input == "number") return;
                interaction.respond(
                    (await db.getQueryInterface().showAllTables())
                        .filter((t) => t.toLowerCase().startsWith(input.toLowerCase()))
                        .map(
                            (table) => ({ name: table, value: table }),
                        ),
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
                        .filter((ccmd) => ccmd.toLowerCase().startsWith(input.toLowerCase()))
                        .map(
                            (ccmd) => ({ name: ccmd, value: ccmd }),
                        ),
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
                                    .filter((ccmd) => ccmd.toLowerCase().startsWith(input.toLowerCase()))
                                    .map(
                                        (ccmd) => ({ name: ccmd, value: ccmd }),
                                    ),
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
                                    .filter((alias) => alias.toLowerCase().startsWith(input.toLowerCase()))
                                    .map(
                                        (alias) => ({ name: alias, value: alias }),
                                    ),
                            );
                        }
                        break;
                    case "blacklist":
                        {
                            const input = interaction.options.getFocused();
                            if (typeof input === "number") return;
                            interaction.respond(
                                (client.blacklist)
                                    .filter((blword) => blword.toLowerCase().startsWith(input.toLowerCase()))
                                    .map(
                                        (blword) => ({ name: blword, value: blword }),
                                    ),
                            );
                        }
                        break;
                }
            }
            break;
        default:
            logger.error(`unknown command while trying to autocomplete: ${interaction.commandName}`);
            break;
    }
}

export const disabled = false;
export const name = "interactionCreate";
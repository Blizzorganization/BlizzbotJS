import { SlashCommandBuilder } from "discord.js";
import logger from "../../../modules/logger.js";
import { permissions } from "../../../modules/utils.js";
import { addAlias } from "./add/alias.js";
import { addBLWord } from "./add/blWord.js";
import { addCustomCommand } from "./add/customCommand.js";

export const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function run(client, interaction) {
    const subCommand = interaction.options.getSubcommand();
    const subCommandGroup = interaction.options.getSubcommandGroup(false);
    if (subCommandGroup) {
        if (subCommandGroup === "alias") {
            addAlias(client, interaction, interaction.options.getSubcommand(true));
            return;
        }
        await interaction.reply(
            interaction.locale === "de"
                ? "Dieser Subcommand scheint nicht vorhanden zu sein, bitte melde dich beim Entwickler."
                : "This subcommand does not seem to exist. please contact the developer.",
        );
    } else {
        switch (subCommand) {
            case "customcommand":
                addCustomCommand(client, interaction);
                break;
            case "blacklistword":
                addBLWord(client, interaction);
                break;
            default:
                logger.warn(`Unknown subcommand add.${subCommand}`);
                await interaction.reply(
                    interaction.locale === "de"
                        ? "Dieser Subcommand scheint nicht vorhanden zu sein, bitte melde dich beim Entwickler."
                        : "This subcommand does not seem to exist. please contact the developer.",
                );
        }
    }
}
export const setup = new SlashCommandBuilder()
    .setName("add")
    .setDefaultPermission(false)
    .setDescription("Add an Alias, a Blacklist word or a Custom Command")
    .setDescriptionLocalization("de", "Füge einen Alias, ein Blacklist Wort oder einen Customcommand hinzu")
    .addSubcommand(
        (subCommand) => subCommand
            .setName("customcommand")
            .setDescription("Add a Custom Command")
            .setDescriptionLocalization("de", "Füge einen Custom Command hinzu")
            .addStringOption(
                (option) => option
                    .setRequired(true)
                    .setName("name")
                    .setDescriptionLocalization("de", "Der Name, auf den der Befehl reagiert")
                    .setDescription("The name used to call the command"),
            )
            .addStringOption(
                (option) => option
                    .setRequired(true)
                    .setName("response")
                    .setDescriptionLocalization("de", "Die Antwort des Befehls")
                    .setDescription("The response sent when using the command"),
            ),
    )
    .addSubcommandGroup(
        (subCommandGroup) => subCommandGroup
            .setName("alias")
            .setDescription("Add an Alias")
            .setDescriptionLocalization("de", "Füge einen Alias hinzu")
            .addSubcommand((subCommand) => subCommand
                .setName("customcommand")
                .setDescription("An Alias referencing a customcommand")
                .setDescriptionLocalization("de", "Ein Alias, der auf einen Customcommand verweist")
                .addStringOption(
                    (option) => option
                        .setRequired(true)
                        .setName("name")
                        .setDescriptionLocalization("de", "Der Name, auf den der Alias reagiert")
                        .setDescription("The name of the alias"),
                )
                .addStringOption(
                    (option) => option
                        .setRequired(true)
                        .setName("command")
                        .setDescriptionLocalization("de", "Der Custom Command auf den verwiesen wird")
                        .setDescription("The referenced Custom Command")
                        .setAutocomplete(true),
                ),
            )
            .addSubcommand((subCommand) => subCommand
                .setName("command")
                .setDescription("An Alias referencing a command")
                .setDescriptionLocalization("de", "Ein Alias, der auf einen Befehl verweist")
                .addStringOption(
                    (option) => option
                        .setRequired(true)
                        .setName("name")
                        .setDescriptionLocalization("de", "Der Name, auf den der Alias reagiert")
                        .setDescription("The name of the alias"),
                )
                .addStringOption(
                    (option) => option
                        .setRequired(true)
                        .setName("command")
                        .setDescriptionLocalization("de", "Der Befehl, auf den verwiesen wird")
                        .setDescription("The referenced command")
                        .setAutocomplete(true),
                ),
            ),
    )
    .addSubcommand(
        (subCommand) => subCommand
            .setName("blacklistword")
            .setDescription("Add a Blacklist Word")
            .setDescriptionLocalization("de", "Füge ein Wort zur Blacklist hinzu")
            .addStringOption(
                (option) => option
                    .setRequired(true)
                    .setName("word")
                    .setDescriptionLocalization("de", "Das Wort, das zur Blacklist hinzugefügt werden soll")
                    .setDescription("The word to add to the blacklist"),
            ),
    )
    .toJSON();

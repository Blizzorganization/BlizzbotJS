import { SlashCommandBuilder } from "discord.js";
import logger from "../../modules/logger.js";
import { permissions } from "../../modules/utils.js";
import { deleteAlias } from "./delete/alias.js";
import { deleteBLWord } from "./delete/blWord.js";
import { deleteCustomCommand } from "./delete/customCommand.js";

export const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function run(client, interaction) {
  const subCommand = interaction.options.getSubcommand();
  const subCommandGroup = interaction.options.getSubcommandGroup(false);
  if (subCommandGroup) {
    if (subCommandGroup === "alias") {
      deleteAlias(client, interaction);
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
        deleteCustomCommand(client, interaction);
        break;
      case "blacklistword":
        deleteBLWord(client, interaction);
        break;
      default:
        logger.warn(`Unknown subcommand delete.${subCommand}`);
        await interaction.reply(
          interaction.locale === "de"
            ? "Dieser Subcommand scheint nicht vorhanden zu sein, bitte melde dich beim Entwickler."
            : "This subcommand does not seem to exist. please contact the developer.",
        );
    }
  }
}
export const setup = new SlashCommandBuilder()
  .setName("delete")
  .setDefaultPermission(false)
  .setDescription("Delete an Alias, a Blacklist word or a Custom Command")
  .setDescriptionLocalization(
    "de",
    "Entferne einen Alias, ein Blacklist Wort oder einen Customcommand",
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("customcommand")
      .setDescription("Delete a Custom Command")
      .setDescriptionLocalization("de", "Entferne einen Custom Command")
      .addStringOption((option) =>
        option
          .setRequired(true)
          .setName("name")
          .setDescriptionLocalization("de", "Der Name, des Befehls")
          .setDescription("The name used to call the command")
          .setAutocomplete(true),
      ),
  )
  .addSubcommandGroup((subCommandGroup) =>
    subCommandGroup
      .setName("alias")
      .setDescription("Delete an Alias")
      .setDescriptionLocalization("de", "Entferne einen Alias")
      .addSubcommand((subCommand) =>
        subCommand
          .setName("customcommand")
          .setDescription("An Alias referencing a customcommand")
          .setDescriptionLocalization(
            "de",
            "Ein Alias, der auf einen Customcommand verweist",
          )
          .addStringOption((option) =>
            option
              .setRequired(true)
              .setName("name")
              .setDescriptionLocalization(
                "de",
                "Der Name, auf den der Alias reagiert",
              )
              .setDescription("The name of the alias")
              .setAutocomplete(true),
          ),
      )
      .addSubcommand((subCommand) =>
        subCommand
          .setName("command")
          .setDescription("An Alias referencing a command")
          .setDescriptionLocalization(
            "de",
            "Ein Alias, der auf einen Befehl verweist",
          )
          .addStringOption((option) =>
            option
              .setRequired(true)
              .setName("name")
              .setDescriptionLocalization(
                "de",
                "Der Name, auf den der Alias reagiert",
              )
              .setDescription("The name of the alias")
              .setAutocomplete(true),
          ),
      ),
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("blacklistword")
      .setDescription("Delete a Blacklist Word")
      .setDescriptionLocalization("de", "Entferne ein Wort von der Blacklist")
      .addStringOption((option) =>
        option
          .setRequired(true)
          .setName("word")
          .setDescriptionLocalization(
            "de",
            "Das Wort, das zur Blacklist hinzugefügt werden soll",
          )
          .setDescription("The word to add to the blacklist")
          .setAutocomplete(true),
      ),
  )
  .toJSON();
// alias    Alias vom command
// command   befehle
// blacklist blacklist

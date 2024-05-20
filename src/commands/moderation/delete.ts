import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import type {
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { deleteAlias } from "./delete/alias";
import { deleteBLWord } from "./delete/blWord";
import { deleteCustomCommand } from "./delete/customCommand";

export default new (class DeleteCommand extends Command {
  public name = "delete";
  public perm = permissions.mod;
  public setup: RESTPostAPIChatInputApplicationCommandsJSONBody =
    new SlashCommandBuilder()
      .setName("delete")
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
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
      .addSubcommand((subCommand) =>
        subCommand
          .setName("alias")
          .setDescription("Delete an Alias")
          .setDescriptionLocalization("de", "Entferne einen Alias")
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
          .setName("blacklistword")
          .setDescription("Delete a Blacklist Word")
          .setDescriptionLocalization(
            "de",
            "Entferne ein Wort von der Blacklist",
          )
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
  async run(client: DiscordClient, interaction: ChatInputCommandInteraction) {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case "customcommand":
        await deleteCustomCommand(client, interaction);
        break;
      case "alias":
        await deleteAlias(client, interaction);
        break;
      case "blacklistword":
        await deleteBLWord(client, interaction);
        break;
      default:
        logger.warning(`Unknown subcommand delete.${subCommand}`);
        await interaction.reply(
          interaction.locale === "de"
            ? "Dieser Subcommand scheint nicht vorhanden zu sein, bitte melde dich beim Entwickler."
            : "This subcommand does not seem to exist. please contact the developer.",
        );
    }
  }
})();

// alias    Alias vom command
// command   befehle
// blacklist blacklist

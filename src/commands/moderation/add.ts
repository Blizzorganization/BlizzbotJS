import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { addAlias } from "./add/alias";
import { addBLWord } from "./add/blWord";
import { addCustomCommand } from "./add/customCommand";

export default new (class AddCommand extends Command {
  public perm = permissions.mod;
  public name = "add";
  public setup = new SlashCommandBuilder()
    .setName("add")
    .setDefaultPermission(false)
    .setDescription("Add an Alias, a Blacklist word or a Custom Command")
    .setDescriptionLocalization(
      "de",
      "Füge einen Alias, ein Blacklist Wort oder einen Customcommand hinzu",
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("customcommand")
        .setDescription("Add a Custom Command")
        .setDescriptionLocalization("de", "Füge einen Custom Command hinzu")
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName("name")
            .setDescriptionLocalization(
              "de",
              "Der Name, auf den der Befehl reagiert",
            )
            .setDescription("The name used to call the command"),
        )
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName("response")
            .setDescriptionLocalization("de", "Die Antwort des Befehls")
            .setDescription("The response sent when using the command"),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("alias")
        .setDescription("Add an Alias")
        .setDescriptionLocalization("de", "Füge einen Alias hinzu")
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
            .setDescription("The name of the alias"),
        )
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName("command")
            .setDescriptionLocalization(
              "de",
              "Der Custom Command auf den verwiesen wird",
            )
            .setDescription("The referenced Custom Command")
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("blacklistword")
        .setDescription("Add a Blacklist Word")
        .setDescriptionLocalization("de", "Füge ein Wort zur Blacklist hinzu")
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName("word")
            .setDescriptionLocalization(
              "de",
              "Das Wort, das zur Blacklist hinzugefügt werden soll",
            )
            .setDescription("The word to add to the blacklist"),
        ),
    )
    .toJSON();
  public async run(
    client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case "customcommand":
        addCustomCommand(client, interaction);
        break;
      case "alias":
        addAlias(client, interaction);
        break;
      case "blacklistword":
        addBLWord(client, interaction);
        break;
      default:
        logger.warning(`Unknown subcommand add.${subCommand}`);
        await interaction.reply(
          interaction.locale === "de"
            ? "Dieser Subcommand scheint nicht vorhanden zu sein, bitte melde dich beim Entwickler."
            : "This subcommand does not seem to exist. please contact the developer.",
        );
    }
  }
})();

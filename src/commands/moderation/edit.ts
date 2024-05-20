import { CustomCommands } from "$/db/CustomCommands";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { db } from "$/modules/db";
import config from "$/modules/config";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

export default new (class EditCommand extends Command {
  public perm = permissions.mod;
  public name = "edit";
  public setup = new SlashCommandBuilder()
    .setName("edit")
    .setDefaultPermission(false)
    .setDescription("Edit a Custom Command")
    .setDescriptionLocalization("de", "Bearbeite einen Customcommand")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command you want to edit")
        .setDescriptionLocalization(
          "de",
          "Der Befehl, den du bearbeiten möchtest",
        )
        .setAutocomplete(true)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("response")
        .setDescription("The response bound to the command")
        .setDescriptionLocalization(
          "de",
          "Die Antwort, die dem Befehl zugewiesen ist",
        )
        .setRequired(true),
    )
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();
    const response = interaction.options.getString("response", true);
    const [ccmd] = await db
      .update(CustomCommands)
      .set({ response })
      .where(eq(CustomCommands.commandName, commandName))
      .returning();
    if (!ccmd) {
      await interaction.reply(
        interaction.locale === "de"
          ? "Ein solcher Befehl existiert nicht."
          : "There is no such command.",
      );
      return;
    }
    await interaction.reply(
      interaction.locale === "de"
        ? `Der Befehl wurde ${config.discord.prefix}${ccmd?.commandName} erfolgreich aktualisiert.`
        : "The command was updated.",
    );
  }
})();

// command   befehle

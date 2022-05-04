import { SlashCommandBuilder } from "@discordjs/builders";
import { CustomCommand } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";
export const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").CommandInteraction} interaction
 */
export async function run(client, interaction) {
    const commandName = interaction.options.getString("command", true).toLowerCase();
    const response = interaction.options.getString("response", true);
    const ccmd = await CustomCommand.findOne({ where: { commandName } });
    if (!ccmd) return await interaction.reply(interaction.locale === "de" ? "Ein solcher Befehl existiert nicht." : "There is no such command.");
    await ccmd.update({ response: response });
    await interaction.reply(interaction.locale === "de" ? "Der Befehl wurde erfolgreich aktualisiert." : "The command was updated.");
}

export const setup = new SlashCommandBuilder()
    .setName("edit")
    .setDefaultPermission(false)
    .setDescription("Edit a Custom Command")
    .setDescriptionLocalization("de", "Bearbeite einen Customcommand")
    .addStringOption((option) => option
        .setName("command")
        .setDescription("The command you want to edit")
        .setDescriptionLocalization("de", "Der Befehl, den du bearbeiten möchtest")
        .setAutocomplete(true)
        .setRequired(true),
    )
    .addStringOption((option) => option
        .setName("response")
        .setDescription("The response bound to the command")
        .setDescriptionLocalization("de", "Die Antwort, die dem Befehl zugewiesen ist")
        .setRequired(true),
    ).toJSON();
// command   befehle
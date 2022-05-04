import { Alias } from "../../../../modules/db.js";

/**
 * @param  {import("../../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").CommandInteraction} interaction
 * @param  {"command"|"customcommand"} type
 */
export async function addAlias(client, interaction, type) {
    const alias = interaction.options.getString("name", true);
    const command = interaction.options.getString("command", true);
    await Alias.create({
        name: alias,
        command,
        type: type === "command" ? "cmd" : "ccmd",
    });
    await interaction.reply(interaction.locale === "de" ? "Der Alias wurde erfolgreich hinzugefügt" : "The Alias was added.");
}
import { CustomCommand } from "../../../../modules/db.js";
import logger from "../../../../modules/logger.js";

/**
 * @param  {import("../../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function addCustomCommand(client, interaction) {
    let name = interaction.options.getString("name", true).toLowerCase();
    if (name.startsWith(client.config.prefix)) name = name.replace(client.config.prefix, "");
    const response = interaction.options.getString("response", true);
    const lastEditor = interaction.user.id;
    const ccmd = await CustomCommand.create({
        commandName: name,
        response,
        lastEditedBy: lastEditor,
    });
    logger.info(`Added Customcommand: ${ccmd.commandName}`);
    interaction.reply({
        content: interaction.locale === "de"
            ? `Der Befehl ${client.config.prefix}${ccmd.commandName} wurde hinzugefügt`
            : `The CustomCommand ${client.config.prefix}${ccmd.commandName} was added`,
    });
}
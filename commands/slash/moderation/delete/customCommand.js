import { Alias, CustomCommand } from "../../../../modules/db.js";
import logger from "../../../../modules/logger.js";

/**
 * @param  {import("../../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function deleteCustomCommand(client, interaction) {
    let name = interaction.options.getString("name", true).toLowerCase();
    if (name.startsWith(client.config.prefix)) name = name.replace(client.config.prefix, "");
    const ccmd = await CustomCommand.findOne({ where: { commandName: name } });
    logger.info(`Delete Customcommand: ${ccmd?.commandName}`);
    const linkedAliases = await Alias.destroy({ where: {
        command: name,
        type: "ccmd",
    } });
    interaction.reply({
        content: interaction.locale === "de"
            ? `Der Befehl ${client.config.prefix}${name} und seine ${linkedAliases} zugehörigen Aliase wurden gelöscht.`
            : `The CustomCommand ${client.config.prefix}${ccmd.commandName} was deleted`,
    });
    await ccmd.destroy();
}
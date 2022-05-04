import { Alias } from "../../../../modules/db.js";

/**
 * @param  {import("../../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").CommandInteraction} interaction
 * @param  {"command"|"customcommand"} type
 */
export async function deleteAlias(client, interaction) {
    const aliasName = interaction.options.getString("name", true);
    const alias = await Alias.findByPk(aliasName);
    await alias.destroy();
}
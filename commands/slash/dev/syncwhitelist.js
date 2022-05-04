import { SlashCommandBuilder } from "@discordjs/builders";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, interaction) {
    await client.syncWhitelist();
    await interaction.reply(interaction.locale === "de" ? "Die Whitelist wurde synchronisert." : "whitelistsync");
}

const setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("syncwhitelist")
    .setDescription("synchronizes the whitelist")
    .setDescriptionLocalization("de", "Syncronisiert die Whitelist").toJSON();

export { perm, run, setup };

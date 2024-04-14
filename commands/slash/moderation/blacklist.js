import { SlashCommandBuilder } from "discord.js";
import { Util } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
    const blwords = client.blacklist;
    if (blwords.length == 0) return interaction.reply("Die Blacklist ist leer.");
    const joinedBlacklist = `\`\`\`fix\n${blwords.join("\n")}\`\`\``;
    const sendable = Util.splitMessage(joinedBlacklist, {
        append: "```",
        char: "\n",
        prepend: "```fix\n",
    });
    let replied = false;
    for (const toSend of sendable) {
        if (!replied) {
            await interaction.reply(toSend);
            replied = true;
        } else {
            await interaction.reply(toSend);
        }
    }
}
const setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("blacklist")
    .setDescription("Shows the current blacklist")
    .setDescriptionLocalization("de", "Zeigt die Aktuelle Blacklist an")
    .toJSON();

export { perm, run, setup };

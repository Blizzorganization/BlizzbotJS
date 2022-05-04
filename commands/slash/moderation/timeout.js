import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").CommandInteraction} interaction
 */
async function run(client, interaction) {
    let user = interaction.options.getMember("user", true);
    if (!(user instanceof GuildMember)) user = await user.fetch();
    const time = interaction.options.getString("time", true).split(":");
    const reason = interaction.options.getString("reason", false);
    const seconds = parseInt(time.pop());
    const minutes = parseInt(time.pop());
    const hours = parseInt(time.pop());
    const days = parseInt(time.pop());
    let timeout = 0;
    if (!isNaN(days)) timeout += days;
    timeout *= 24;
    if (!isNaN(hours)) timeout += hours;
    timeout *= 60;
    if (!isNaN(minutes)) timeout += minutes;
    timeout *= 60;
    if (!isNaN(seconds)) timeout += seconds;
    timeout *= 1000;
    await user.timeout(timeout, reason);
    interaction.reply({ content: `Der Nutzer ${user.user.username} wurde getimeoutet.`, ephemeral: true });
}
const setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("timeout")
    .addUserOption(
        new SlashCommandUserOption()
            .setDescriptionLocalization("de", "Der Nutzer, den du timeouten möchtest")
            .setDescription("The user you want to timeout")
            .setName("user")
            .setRequired(true),
    )
    .addStringOption(
        new SlashCommandStringOption()
            .setName("time")
            .setDescription("how long the user shall be timeouted (format dd:hh:mm:ss)")
            .setDescriptionLocalization("de", "Wie lange der Nutzer getimeoutet werden soll (Format dd:hh:mm:ss)")
            .setRequired(true),
    )
    .addStringOption(
        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("Reason for the timeout")
            .setDescriptionLocalization("de", "Grund für den Timeout")
            .setRequired(false),
    )
    .setDescription("Timeout a user")
    .setDescriptionLocalization("de", "Timeoute einen Nutzer").toJSON();

export { perm, run, setup };

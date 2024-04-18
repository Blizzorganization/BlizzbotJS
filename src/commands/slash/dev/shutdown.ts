import { SlashCommandBuilder } from "discord.js";
import { context } from "../../blizzbot.js";
import { permissions } from "../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
  await interaction.reply(
    interaction.locale === "de"
      ? "Der Bot fährt herunter."
      : "Shutting down...",
  );
  context.stop();
}
const setup = new SlashCommandBuilder()
  .setDefaultPermission(false)
  .setName("shutdown")
  .setDescription("stop the bot")
  .setDescriptionLocalization("de", "Fährt den Bot runter")
  .toJSON();

export { perm, run, setup };

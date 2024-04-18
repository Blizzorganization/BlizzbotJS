import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MCUser, XPUser } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";
import DiscordClient from "../../../modules/DiscordClient.js";

const perm = permissions.dev;

async function run(client: DiscordClient, interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("name", true);
  await MCUser.destroy({ where: { discordId: user.id }, limit: 1 });
  await XPUser.destroy({
    where: { discordId: user.id, guildId: interaction.guildId },
  });
  await interaction.reply(
    interaction.locale === "de"
      ? "Der Nutzer wurde zurückgesetzt."
      : "The user has been reset.",
  );
}
const setup = new SlashCommandBuilder()
  .setName("resetuser")
  .setDescription("Deletes a user's data from the database")
  .setDescriptionLocalization(
    "de",
    "Löscht alle Daten vom User aus der Datenbank",
  )
  .addUserOption((option) =>
    option
      .setDescriptionLocalization(
        "de",
        "Der Nutzer dessen Daten gelöscht werden sollen",
      )
      .setDescription("The user to reset the data for")
      .setName("user")
      .setRequired(true)
      .setNameLocalization("de", "nutzer"),
  )
  .toJSON();

export { perm, run, setup };

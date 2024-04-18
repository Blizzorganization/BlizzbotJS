import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { XPUser } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";
import Client from "../../../modules/DiscordClient.js";

const perm = permissions.dev;

async function run(client: Client, interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("user", true);
  const xpuser = await XPUser.findOne({
    where: { discordId: user.id, guildId: interaction.guildId },
  });
  await xpuser?.update({ experience: 0 });
  await xpuser?.save();
  await interaction.reply(
    interaction.locale === "de"
      ? "Der Rang dieses Nutzers wurde zurückgesetzt."
      : "The user's rank has been reset.",
  );
}
const setup = new SlashCommandBuilder()
  .setDefaultPermission(false)
  .setName("resetrank")
  .setDescription("Reset a user's rank")
  .setDescriptionLocalization("de", "Setzt den Rang des Users zurück")
  .addUserOption((option) =>
    option
      .setName("user")
      .setNameLocalization("de", "nutzer")
      .setDescription("The user to reset the rank for")
      .setDescriptionLocalization(
        "de",
        "Der Nutzer dessen Rang zurückgesetzt werden soll",
      )
      .setRequired(true),
  )
  .toJSON();

export { perm, run, setup };

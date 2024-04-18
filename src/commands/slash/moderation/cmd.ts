import { SlashCommandBuilder } from "discord.js";
import { Util } from "discord.js";
import { CustomCommand } from "../../modules/db.js";
import { permissions } from "../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
  const cmds = await CustomCommand.findAll();
  const commandNames = cmds.map(
    (cmd) => `${client.config.prefix}${cmd.commandName}`,
  );
  const msg = `Es existieren folgende Befehle: ${commandNames.join(", ")}`;
  for (const content of Util.splitMessage(msg, { char: ", " })) {
    await message.reply({ content });
  }
}
const setup = new SlashCommandBuilder()
  .setDefaultPermission(false)
  .setName("cmd")
  .setDescription("Shows the existing Customcommands")
  .setDescriptionLocalization("de", "Zeigt die alle Customcommands an")
  .toJSON();

export { perm, run, setup };

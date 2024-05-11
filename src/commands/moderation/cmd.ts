import { CustomCommands } from "$/db/CustomCommands";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import { db } from "$/modules/db";
import { splitMessage } from "$/modules/splitMessage";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export default new (class CmdCommand extends Command {
  public perm = permissions.mod;
  public name = "cmd";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("cmd")
    .setDescription("Shows the existing Customcommands")
    .setDescriptionLocalization("de", "Zeigt die alle Customcommands an")
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const cmds = await db
      .select({ name: CustomCommands.commandName })
      .from(CustomCommands);
    const commandNames = cmds.map(
      (cmd) => `${config.discord.prefix}${cmd.name}`,
    );
    const msg = `Es existieren folgende Befehle: ${commandNames.join(", ")}`;
    let replied = false;
    for (const content of splitMessage(msg, { char: ", " })) {
      if (!replied) {
        await interaction.reply({ content });
        replied = true;
      }
      await interaction.channel?.send({ content });
    }
  }
})();

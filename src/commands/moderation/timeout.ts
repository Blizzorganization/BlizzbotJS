import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { permissions } from "$/modules/utils";
import type { ChatInputCommandInteraction } from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js";

export default new (class TimeoutCommand extends Command {
  public perm = permissions.mod;
  public name = "timeout";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("timeout")
    .addUserOption(
      new SlashCommandUserOption()
        .setDescriptionLocalization(
          "de",
          "Der Nutzer, den du timeouten möchtest",
        )
        .setDescription("The user you want to timeout")
        .setName("user")
        .setRequired(true),
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("time")
        .setDescription(
          "how long the user shall be timeouted (format dd:hh:mm:ss)",
        )
        .setDescriptionLocalization(
          "de",
          "Wie lange der Nutzer getimeoutet werden soll (Format dd:hh:mm:ss)",
        )
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
    .setDescriptionLocalization("de", "Timeoute einen Nutzer")
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<"cached">,
  ): Promise<void> {
    const user = interaction.options.getMember("user");
    if (!user) return;
    const time = interaction.options.getString("time", true).split(":");
    const reason = interaction.options.getString("reason", false);
    const seconds = Number.parseInt(time.pop() ?? "");
    const minutes = Number.parseInt(time.pop() ?? "");
    const hours = Number.parseInt(time.pop() ?? "");
    const days = Number.parseInt(time.pop() ?? "");
    let timeout = 0;
    if (!Number.isNaN(days)) timeout += days;
    timeout *= 24;
    if (!Number.isNaN(hours)) timeout += hours;
    timeout *= 60;
    if (!Number.isNaN(minutes)) timeout += minutes;
    timeout *= 60;
    if (!Number.isNaN(seconds)) timeout += seconds;
    timeout *= 1000;
    await user.timeout(timeout, reason ?? undefined);
    await interaction.reply({
      content: `Der Nutzer ${user.user.username} wurde getimeoutet.`,
      ephemeral: true,
    });
  }
})();

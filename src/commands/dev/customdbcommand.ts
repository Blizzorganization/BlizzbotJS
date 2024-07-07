import { inspect } from "node:util";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { sql } from "$/modules/db";
import { splitMessage } from "$/modules/splitMessage";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export default new (class CustomDBCommandCommand extends Command {
  public perm = permissions.dev;
  public name = "customdbcommand";
  public setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("customdbcommand")
    .addStringOption((option) =>
      option
        .setDescription("the query")
        .setName("sql")
        .setRequired(true)
        .setDescriptionLocalization("de", "Die Abfrage"),
    )
    .setDescriptionLocalization("de", "Führe einen Befehl in der Datenbank aus")
    .setDescription("execute a database command")
    .toJSON();
  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const query = interaction.options.getString("sql", true);
    let replied = false;
    const data = await sql.unsafe(query).catch(async (reason) => {
      for (const reasonPart of splitMessage(
        `Deine Anfrage ergab einen Fehler: ${inspect(reason)}`,
      )) {
        if (!replied) {
          await interaction.reply(reasonPart);
          replied = true;
        } else {
          await interaction.channel?.send(reasonPart);
        }
      }
    });
    if (!data) return;
    const [result] = data;
    for (const resultPart of splitMessage(
      `\`\`\`js\n${inspect(result)}\`\`\``,
      {
        append: "```",
        prepend: "```js\n",
        char: "\n",
      },
    )) {
      if (!replied) {
        await interaction.reply(resultPart);
        replied = true;
      } else {
        await interaction.channel?.send(resultPart);
      }
    }
  }
})();

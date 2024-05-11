import { Aliases } from "$/db/Aliases";
import { CustomCommands } from "$/db/CustomCommands";
import { mcnames } from "$/db/mcnames";
import { ranking } from "$/db/ranking";
import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import { db } from "$/modules/db";
import { splitMessage } from "$/modules/splitMessage";
import { createTable, permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { desc } from "drizzle-orm";

export default new (class CheckDBCommand extends Command {
  public perm = permissions.dev;
  public name = "checkdb";
  public setup = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription("")
    .setDescriptionLocalization(
      "de",
      "zeigt eine übersicht der Daten in der Datenbank",
    )
    .addStringOption((opt) =>
      opt
        .setChoices([])
        .setName("table")
        .setNameLocalization("de", "Tabelle")
        .setRequired(true)
        .setDescriptionLocalization("de", "Die anzuzeigende Tabelle")
        .setDescription("The database table to show"),
    )
    .toJSON();

  public async run(
    _client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    let tableData: unknown[];
    let table: string;
    const tableName = interaction.options.getString("table", true);
    switch (tableName) {
      case "ranking":
        tableData = await db
          .select()
          .from(ranking)
          .orderBy(desc(ranking.experience));
        table = createTable(
          (tableData as (typeof ranking.$inferSelect)[]).map((elem) => {
            return {
              Name: elem.username,
              Active: elem.available ? "yes" : "no",
              Experience: elem.experience,
              "Discord ID": elem.discordId,
              "Discord Server ID": elem.guildId,
            };
          }),
        );
        break;
      case "mcnames":
        tableData = await db.select().from(mcnames);
        table = createTable(
          (tableData as (typeof mcnames.$inferSelect)[]).map((elem) => {
            return {
              "Minecraft Name": elem.mcName,
              "Minecraft UUID": elem.mcId,
              "Discord ID": elem.discordId,
              "Whitelist YouTube": elem.whitelistYoutube ? "yes" : "no",
              "Whitelist Twitch": elem.whitelistTwitch ? "yes" : "no",
            };
          }),
        );
        break;
      case "CustomCommands":
        tableData = await db.select().from(CustomCommands);
        table = createTable(
          (tableData as (typeof CustomCommands.$inferSelect)[]).map((elem) => ({
            name: elem.commandName,
            response: elem.response,
            "last editor": elem.lastEditedBy,
          })),
        );
        break;
      case "Aliases":
        tableData = await db.select().from(Aliases);
        table = createTable(
          (tableData as (typeof Aliases.$inferSelect)[]).map((elem) => ({
            command: elem.command,
            alias: elem.name,
            id: elem.id,
          })),
        );
        table = createTable(tableData);
        break;
      default:
        table = "There is no such table.";
        break;
    }
    table = `${tableName}\n\`\`\`fix\n${table}\`\`\``;
    const splitTable = splitMessage(table, {
      append: "```",
      prepend: "```fix\n",
      char: "\n",
    });
    let replied = false;
    for (const toSend of splitTable) {
      if (!replied) {
        replied = true;
        await interaction.reply(toSend);
      } else {
        await interaction.channel?.send(toSend);
      }
    }
  }
})();

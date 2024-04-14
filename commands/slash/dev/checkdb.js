import { SlashCommandBuilder } from "discord.js";
import { db } from "../../../modules/db.js";
import { createTable, permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
    let tableData;
    let table;
    const tableName = interaction.options.getString("table", true);
    switch (tableName) {
        case "ranking":
            [tableData] = await db.query("SELECT * FROM \"ranking\" ORDER BY experience DESC;");
            table = createTable(tableData.map((elem) => {
                return {
                    "Name": elem.username,
                    "Active": elem.available ? "yes" : "no",
                    "Experience": elem.experience,
                    "Discord ID": elem.discordId,
                    "Discord Server ID": elem.guildId,
                };
            }));
            break;
        case "mcnames":
            [tableData] = await db.query("SELECT * FROM \"mcnames\";");
            table = createTable(tableData.map((elem) => {
                return {
                    "Minecraft Name": elem.mcName,
                    "Minecraft UUID": elem.mcId,
                    "Discord ID": elem.discordId,
                    "Whitelist YouTube": elem.whitelistYouTube ? "yes" : "no",
                    "Whitelist Twitch": elem.whitelistTwitch ? "yes" : "no",
                };
            }));
            break;
        case "CustomCommands":
            [tableData] = await db.query("SELECT * FROM \"CustomCommands\";");
            table = createTable(tableData.map((elem) => {
                return {
                    name: elem.commandName,
                    response: elem.response,
                    "last editor": elem.lastEditedBy,
                    "last edit time": elem.updatedAt.toLocaleString("de-DE"),
                    "deleted": elem.deletedAt === null ? "no" : "yes",
                };
            }));
            break;
        case "Aliases":
            [tableData] = await db.query("SELECT * FROM \"Aliases\";");
            table = createTable(tableData.filter((elem) => elem.deletedAt === null).map((elem) => {
                return {
                    "command": elem.command,
                    "alias": elem.name,
                    "command type": elem.type,
                };
            }));
            break;
        default:
            table = createTable(tableData);
            break;
    }
    table = `${tableName}\n\`\`\`fix\n${table}\`\`\``;
    const splitTable = Util.splitMessage(table, {
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
            await interaction.channel.send(toSend);
        }
    }
}
const setup = new SlashCommandBuilder()
    .setName("checkdb")
    .addStringOption((option) => option
        .setAutocomplete(true)
        .setName("table")
        .setDescriptionLocalization("de", "Die anzuzeigende Tabelle")
        .setDescription("The database table to show")
        .setRequired(true),
    )
    .setDescription("shows an overview over the database")
    .setDescriptionLocalization("de", "zeigt eine übersicht der Daten in der Datenbank").toJSON();

export { perm, run, setup };

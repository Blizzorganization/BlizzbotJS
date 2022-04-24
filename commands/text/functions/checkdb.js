import { MessageActionRow, MessageButton, Util } from "discord.js";
import { inspect } from "util";
import { db } from "../../../modules/db.js";
import logger from "../../../modules/logger.js";
import { createTable, permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
    const tables = await db.getQueryInterface().showAllTables().catch((reason) => {
        logger.error("Error showing tables: " + reason);
    });
    if (!tables) return logger.log("No Tables");
    logger.debug(`all tables: ${inspect(tables)}`);
    const row = new MessageActionRow();
    tables.forEach((tableName) => {
        row.addComponents(
            new MessageButton()
                .setLabel(tableName)
                .setCustomId(tableName)
                .setStyle("PRIMARY"),
        );
    });
    const tableQuestion = await message.channel.send({ content: "Welche Tabelle möchtest du dir anzeigen lassen?", components: [row] });
    const collector = tableQuestion.createMessageComponentCollector({ componentType: "BUTTON" });
    collector.on("collect", async (interaction) => {
        if (!tables.includes(interaction.customId)) return interaction.reply({ content: "Ein Fehler ist aufgetreten." });
        let tableData;
        let table;
        switch (interaction.customId) {
            case "ranking":
                [tableData] = await db.query("SELECT * FROM \"ranking\" ORDER BY experience DESC;");
                table = createTable(tableData.map((elem) => {
                    return {
                        "Name":             elem.username,
                        "Active":           elem.available ? "yes" : "no",
                        "Experience":       elem.experience,
                        "Discord ID":       elem.discordId,
                        "Discord Server ID":elem.guildId,
                    };
                }));
                break;
            case "mcnames":
                [tableData] = await db.query("SELECT * FROM \"mcnames\";");
                table = createTable(tableData.map((elem) => {
                    return {
                        "Minecraft Name":   elem.mcName,
                        "Minecraft UUID":   elem.mcId,
                        "Discord ID":       elem.discordId,
                        "Whitelist YouTube":elem.whitelistYouTube ? "yes" : "no",
                        "Whitelist Twitch": elem.whitelistTwitch ? "yes" : "no",
                    };
                }));
                break;
            case "CustomCommands":
                [tableData] = await db.query("SELECT * FROM \"CustomCommands\";");
                table = createTable(tableData.map((elem) => {
                    return {
                        name:               elem.commandName,
                        response:           elem.response,
                        "last editor":      elem.lastEditedBy,
                        "last edit time":   elem.updatedAt.toLocaleString("de-DE"),
                        "deleted":          elem.deletedAt === null ? "no" : "yes",
                    };
                }));
                break;
            case "Aliases":
                [tableData] = await db.query("SELECT * FROM \"Aliases\";");
                table = createTable(tableData.filter((elem) => elem.deletedAt === null).map((elem) => {
                    return {
                        "command":      elem.command,
                        "alias":        elem.name,
                        "command type": elem.type,
                    };
                }));
                break;
            default:
                table = createTable(tableData);
                break;
        }
        table = `${interaction.customId}\n\`\`\`fix\n${table}\`\`\``;
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
                await interaction.message.channel.send(toSend);
            }
        }
    });
}
export { perm, run };

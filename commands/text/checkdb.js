import { MessageActionRow, MessageButton, Util } from "discord.js";
import { inspect } from "util";
import { db } from "../../modules/db.js";
import logger from "../../modules/logger.js";
import { createTable, permissions } from "../../modules/utils.js";

const aliases = ["checkdb", "checkdatabase"];
const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function run(client, message) {
    const tables = await db.getQueryInterface().showAllTables().catch((reason) => {
        logger.error("Error showing tables: " + reason);
    });
    if (!tables) return;
    logger.info("all tables: " + inspect(tables));
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
                        name:   elem.username,
                        active: elem.available,
                        exp:    elem.experience,
                        dcid:   elem.discordId,
                        gid:    elem.guildId,
                    };
                }));
                break;
            case "mcnames":
                [tableData] = await db.query("SELECT * FROM \"mcnames\";");
                table = createTable(tableData.map((elem) => {
                    return {
                        mcName: elem.mcName,
                        uuid:   elem.mcId,
                        dcid:   elem.discordId,
                        yt:     elem.whitelistYouTube,
                        tw:     elem.whitelistTwitch,
                    };
                }));
                table = createTable(tableData);
                break;
            case "CustomCommands":
                [tableData] = await db.query("SELECT * FROM \"CustomCommands\";");
                table = createTable(tableData.map((elem) => {
                    return {
                        name: elem.commandName,
                        response: elem.response,
                        "last editor": elem.lastEditedBy,
                    };
                }));
                table = createTable(tableData);
                break;
            default:
                table = createTable(tableData);
                break;
        }
        table = "```fix\n" + table + "```";
        const splitTable = Util.splitMessage(table, {
            append: "```",
            prepend: "```fix\n",
            char: "\n",
        });
        let replied = false;
        for (const toSend of splitTable) {
            if (!replied) {
                replied = true;
                interaction.reply(toSend);
            } else {
                interaction.message.channel.send(toSend);
            }
        }
    });
}

export { aliases, perm, run };

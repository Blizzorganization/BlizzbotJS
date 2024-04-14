import { SlashCommandBuilder } from "discord.js";
import { inspect } from "util";
import { db } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.dev;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function run(client, interaction) {
    const sql = interaction.options.getString("sql", true);
    let replied = false;
    const data = await db.query(sql)
        .catch(async (reason) => {
            for (const reasonPart of splitMessage(`Deine Anfrage ergab einen Fehler: ${inspect(reason)}`)) {
                if (!replied) {
                    await interaction.reply(reasonPart);
                    replied = true;
                } else { await interaction.channel?.send(reasonPart); }
            }
        });
    if (data) {
        const [result] = data;
        for (const resultPart of splitMessage(`\`\`\`js\n${inspect(result)}\`\`\``, { append: "```", prepend: "```js\n", char: "\n" })) {
            if (!replied) {
                await interaction.reply(resultPart);
                replied = true;
            } else { await interaction.channel?.send(resultPart); }
        }
    }
}
const setup = new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("customdbcommand")
    .addStringOption((option) => option
        .setDescription("the query")
        .setName("sql")
        .setRequired(true)
        .setDescriptionLocalization("de", "Die Abfrage"),
    )
    .setDescriptionLocalization("de", "Führe einen Befehl in der Datenbank aus")
    .setDescription("execute a database command").toJSON();

export { perm, run, setup };

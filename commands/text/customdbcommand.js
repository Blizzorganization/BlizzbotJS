import { Util } from "discord.js";
import { inspect } from "util";
import { db } from "../../modules/db.js";
import { permissions } from "../../modules/utils.js";

const aliases = ["customdbcommand", "dbquery"];
const perm = permissions.mod;
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const sql = args.join(" ");
    const data = await db.query(sql)
        .catch((reason) => {
            message.channel.send("Deine Anfrage ergab einen Fehler: " + inspect(reason));
        });
    if (data) {
        const [result] = data;
        for (const resultPart of Util.splitMessage(`\`\`\`js\n${inspect(result)}\`\`\``, { append: "```", prepend: "```js\n", char: "\n" })) {
            message.channel.send(resultPart);
        }
    }
}

export { aliases, perm, run };

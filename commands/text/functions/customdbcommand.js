import { Util } from "discord.js";
import { inspect } from "util";
import { db } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.mod;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    const sql = args.join(" ");
    const data = await db.query(sql)
        .catch((reason) => {
            for (const reasonPart of Util.splitMessage(`Deine Anfrage ergab einen Fehler: ${inspect(reason)}`)) {
                message.channel.send(reasonPart);
            }
        });
    if (data) {
        const [result] = data;
        for (const resultPart of Util.splitMessage(`\`\`\`js\n${inspect(result)}\`\`\``, { append: "```", prepend: "```js\n", char: "\n" })) {
            message.channel.send(resultPart);
        }
    }
}
export { perm, run };

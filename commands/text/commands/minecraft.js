import fetch from "node-fetch";
import { MCUser } from "../../../modules/db.js";
import { permissions } from "../../../modules/utils.js";

const perm = permissions.user;
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function run(client, message, args) {
    if (!args || !args[0]) {
        const msg = await message.channel.send("Bitte Minecraftname eingeben");
        const coll = msg.channel.createMessageCollector({ filter: (m => m.author.id == message.author.id) });
        coll.on("collect", (m) => {
            coll.stop();
            if (m.content.startsWith(`${client.config.prefix}`)) return;
            handle(client, m, m.content.split(" "));
        });
    } else {
        handle(client, message, args);
    }
}
/**
 * @param  {import("../../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 */
async function handle(client, message, args) {
    const name = args.join(" ");
    const siteData = await fetch("https://api.mojang.com/users/profiles/minecraft/" + name);
    if (siteData.status == 200) {
        let previous = true;
        let initialName;
        const jsonData = await siteData.json() || JSON.parse(await siteData.text());
        const [mcuser] = await MCUser.findOrCreate({ where: { discordId: message.author.id } });
        if (mcuser.get("mcName") == null) {
            previous = false;
        } else {
            initialName = mcuser.get("mcName");
        }
        mcuser.set({ mcId: jsonData.id });
        mcuser.set({ mcName: jsonData.name });
        mcuser.set({ whitelistTwitch: client.config.roles.whitelist.twitch.some((r) => message.member.roles.cache.has(r)) });
        mcuser.set({ whitelistYouTube: client.config.roles.whitelist.youtube.some((r) => message.member.roles.cache.has(r)) });
        await mcuser.save();
        message.channel.send(!previous ? `Dein Minecraftname **${jsonData.name}** wurde erfolgreich hinzugefügt.` : `Du hast deinen Minecraftnamen von **${initialName}** auf **${jsonData.name}** aktualisiert.`);
        client.syncWhitelist();
    } else {
        message.channel.send("Dieser Name wurde nicht gefunden.");
    }
}
export { perm, run };

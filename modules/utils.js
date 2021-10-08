import { Console } from "console";
import { existsSync, readdirSync } from "fs";
import { sep } from "path";
import { Transform } from "stream";
import { MCUser } from "./db.js";
import logger from "./logger.js";

/**
 * @param  {string} path the command directory
 * @param  {import("discord.js").Collection} commandMap the map to store the loaded commands into
 */
async function loadCommands(path, commandMap) {
    if (!existsSync(path)) throw new Error(`The given command directory ${path} does not exist.`);
    const commandFiles = readdirSync(path);
    commandFiles.forEach(async (fileName) => {
        if (!fileName.endsWith(".js")) return;
        const cmd = await import(`..${sep}${path}${sep}${fileName}`);
        if (!cmd) return logger.warn(`Command ${fileName.split(".")[0]} does not exist.`);
        cmd.aliases.forEach((a) => commandMap.set(a, cmd));
    });

}
/**
 * @param  {import("./DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 */
async function checkWhitelist(client, message) {
    const guild = message.guild;
    const members = await guild.members.fetch();
    const ytroles = client.config.roles.whitelist.youtube;
    const twroles = client.config.roles.whitelist.twitch;
    members.forEach((member) => {
        MCUser.upsert({
            discordId: member.id,
            ytWhitelisted: member.roles.cache.hasAny(ytroles),
            twWhitelisted: member.roles.cache.hasAny(twroles),
        }, {});
    });
}
async function loadEvents(listener, directory) {
    const eventFiles = readdirSync(directory);
    eventFiles.forEach(async (file) => {
        if (!file.endsWith(".js")) return logger.warn(`${directory}${sep}${file} is not a javascript file and does not belong in the event directory`);
        const event = await import(`..${sep}${directory}${sep}${file}`);
        if (event.disabled) return logger.info(`Event ${directory}${sep}${file} is disabled.`);
        if (!event.handle || !event.name) return logger.error(`Event ${directory}${sep}${file} does not have a handle and a name property.`);
        listener.on(event.name, event.handle.bind(null, listener));
    });

}

const permissions = {
    user: 0,
    twitchsub: 1,
    ytsub: 2,
    mod: 5,
    owner: 9,
    dev: 10,
};
/**
 * @param  {import("../../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").Message} message
 * @param  {string[]} args
 * @returns {import("discord.js").User}
 */
function getUser(client, message, args) {
    let user;
    if (message.mentions.users.size > 0) user = message.mentions.users.first();
    if (!user && args && args.length > 0) {
        let name = args.join(" ");
        user = client.users.cache.find(u => u.username === name);
        if (!user) {
            name = name.toLowerCase();
            user = client.users.cache.find(u => u.username.toLowerCase() === name);
            if (!user) user = client.users.cache.get(name);
        }
    }
    return user;
}

const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk); } });
const customConsole = new Console({ stdout: ts });

/**
 * @param  {any[]} list
 * @returns {string} the table as shown using console.table
 */
function createTable(list) {
    customConsole.table(list);
    return (ts.read() || "");
}


export { loadCommands, loadEvents, checkWhitelist, permissions, getUser, createTable };

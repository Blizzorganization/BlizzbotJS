import { CustomCommand, XPUser } from "../modules/db.js";
import logger from "../modules/logger.js";
/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} message
 */
async function handleCommands(client, message) {
    if (!message.content.startsWith(client.config.prefix)) return false;
    const args = message.content.split(/ +/g);
    const command = args.shift().toLowerCase().slice(client.config.prefix.length);
    const cmd = client.commands.get(command);
    if (cmd) {
        cmd.run(client, message, args);
    } else {
        const ccmd = await CustomCommand.findOne({ where: { commandName: command } });
        if (!ccmd) return false;
        await message.channel.send(ccmd.response);
        return true;
    }
}

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} message
 */
function checkMessage(client, message) {
    if (!message.guild) return false;
    if (message.member && message.member.roles && message.member.roles.cache.hasAny(client.config.roles.noFilter)) return false;
    if (client.blacklist.length > 0) {
        const lowerMessage = message.content.toLowerCase();
        if (client.blacklist.some((blword) => lowerMessage.includes(blword))) {message.delete().catch((e) => logger.error("Received an error deleting a message:\n" + e.stack));}
        message.author.createDM().then((dmChannel) => {
            dmChannel.send(`Ihre Nachricht mit dem Inhalt **${message.content}** wurde entfernt. Melden Sie sich bei Fragen an einen Moderator.`);
        });
        return true;
    }
    return false;
}

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} message
 */
export async function handle(client, message) {
    if (!message || message.partial) return;
    if (checkMessage(client, message)) return;
    if (client.config.channels.commands.indexOf(message.channel.id) !== -1) return handleCommands(client, message);
    if (!message.guild) return;
    const [xpuser] = await XPUser.findOrCreate({
        where: {
            discordId: message.author.id,
            guildId: message.guildId,
        },
        defaults: {
            experience: 0,
            available: true,
            username: message.author.username,
        },
    });
    if (xpuser.username !== message.author.username) xpuser.update("username", message.author.username);
    const exp = Math.max(10, Math.floor(((message.content.length) - 2) / 5));
    xpuser.increment("experience", {
        by: exp,
    });
}
export const disabled = false;
export const name = "messageCreate";
import { Alias, CustomCommand, XPUser } from "../modules/db.js";
import logger from "../modules/logger.js";
import { permissions } from "../modules/utils.js";

const linkRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm;

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
        if (cmd.perm === permissions.user) {
            cmd.run(client, message, args);
            return true;
        }
        return false;
    } else {
        const ccmd = await CustomCommand.findOne({ where: { commandName: command } });
        if (ccmd) {
            await message.channel.send(ccmd.response);
            return true;
        } else {
            const alias = Alias.findOne({ where: { name: command } });
            if (!alias) return false;
            if (alias.type === "ccmd") {
                const accmd = await CustomCommand.findOne({ where: { commandName: command } });
                if (accmd) {
                    await message.channel.send(accmd.response);
                    return true;
                }
            }
            if (alias.type === "cmd") {
                const acmd = client.commands.get(alias.command);
                if (acmd) {
                    if (acmd.perm === permissions.user) {
                        acmd.run(client, message, args);
                        return true;
                    }
                    return false;
                }
            }
        }
    }
}

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} message
 */
function handleModCommands(client, message) {
    if (!message.content.startsWith(client.config.prefix)) return false;
    const args = message.content.split(/ +/g);
    const command = args.shift().toLowerCase().slice(client.config.prefix.length);
    const cmd = client.commands.get(command);
    if (cmd) {
        if (cmd.perm <= permissions.mod) return cmd.run(client, message, args);
        if (cmd.perm <= permissions.dev && message.member.roles.cache.has(client.config.roles.dev)) return cmd.run(client, message, args);
        if (message.author.id == message.guild.ownerId) return cmd.run(client, message, args);
    }
}

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").GuildMember} member
 */
function unverify(client, member) {
    member.roles.remove(client.config.roles.verify);
}
/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} message
 * @returns {boolean}
 */
function checkMessage(client, message) {
    if (!message.guild) return false;
    if (message.author.id === client.user.id) return false;
    if (message.member && message.member.roles && message.member.roles.cache.hasAny(client.config.roles.noFilter)) return false;
    const links = [...message.content.matchAll(linkRegex)];
    if (links.length > 0) {
        message.delete();
        let previousLinks = client.linkUsage[message.author.id];
        if (!previousLinks) previousLinks = [];
        previousLinks = previousLinks.filter((link) => message.createdAt.getTime() - link.ts < 5000);
        const newLinks = previousLinks;
        let shouldUnverify = false;
        links.forEach((link) => {
            if (previousLinks.some((previousLink) => previousLink.url == link))shouldUnverify = true;
            newLinks.push({ ts: message.createdAt.getTime(), url: link });
        });
        if (shouldUnverify && message.member.roles.cache.has(client.config.roles.verify)) unverify(client, message.member);
        return true;
    }
    if (client.blacklist.length > 0) {
        const lowerMessage = message.content.toLowerCase();
        if (client.blacklist.some((blword) => lowerMessage.indexOf(blword) !== -1)) {
            message.delete().catch((e) => logger.error("Received an error deleting a message:\n" + e.stack));
            message.author.createDM().then((dmChannel) => {
                dmChannel.send(`Ihre Nachricht mit dem Inhalt **${message.content}** wurde entfernt. Melden Sie sich bei Fragen an einen Moderator.`);
            });
        }
        return true;
    }
    return false;
}

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} message
 */
export async function handle(client, message) {
    if (!message) return;
    if (message.partial) message = await message.fetch();
    if (checkMessage(client, message)) return;
    if (Math.random() > 0.999) message.react(client.config.emojis.randomReaction);
    if (message.channelId == client.config.channels.verificate && message.content.toLowerCase == "!zz") {
        message.member.roles.add(client.config.roles.verify);
        message.delete();
        return;
    }
    if (client.config.channels.commands.includes(message.channelId)) return handleCommands(client, message);

    if (client.config.channels.adminCommands.includes(message.channelId)) return handleModCommands(client, message);
    if (!message.guild) return;
    const [xpuser] = await XPUser.findOrCreate({
        where: {
            discordId: message.author.id,
            guildId: message.guildId,
        },
        defaults: {
            experience: 0,
            available:  true,
            username:   message.author.username,
        },
    });
    if (xpuser.username !== message.author.username) await xpuser.update({ username: message.author.username });
    const exp = Math.max(10, Math.floor(((message.content.length) - 2) / 5));
    await xpuser.increment("experience", {
        by: exp,
    });
}
export const disabled = false;
export const name = "messageCreate";

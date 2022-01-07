import { checkMessage } from "./message.js";

/**
 * @param  {import("../modules/DiscordClient").default} client
 * @param  {import("discord.js").Message} oldMessage
 * @param  {import("discord.js").Message} newMessage
 */
export async function handle(client, oldMessage, newMessage) {
    checkMessage(client, newMessage);
}

export const disabled = false;
export const name = "messageUpdate";

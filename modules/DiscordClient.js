import discord from "discord.js";

class Client extends discord.Client {
    constructor() {
        super({
            intents: [
                discord.Intents.FLAGS.GUILD_MESSAGES,
                discord.Intents.FLAGS.GUILD_MEMBERS
            ]
        });
    }
}

export default Client;
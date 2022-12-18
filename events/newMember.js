/**
 * @param  {import("../modules/DiscordClient.js").default} client
 * @param  {import("discord.js").GuildMember} member
 */
export async function handle(client, member) {
    const welcomeMessage =
    `**Willkommen auf dem Blizzcord Server!**
Bitte lies dir unsere Regeln im Channel _#regelwerk_ durch.
Schon gelesen? Verifiziere dich jetzt indem du \`${client.config.prefix}zz\` im 
_#freischalten_-Channel verwendest oder reagiere auf die Nachricht im Channel.`
        member.send({
            content: welcomeMessage,
        });
}
export const disabled = false;
export const name = "guildMemberAdd";

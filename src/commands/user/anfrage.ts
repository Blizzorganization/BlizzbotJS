import type DiscordClient from "$/modules/DiscordClient";
import { Command } from "$/modules/command";
import config from "$/modules/config";
import logger from "$/modules/logger";
import { permissions } from "$/modules/utils";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export default new (class AnfrageCommand extends Command {
  public name = "anfrage";
  public perm = permissions.user;
  public setup = new SlashCommandBuilder()
    .setName("anfrage")
    .setDescription("Send a request to the mods")
    .setDescriptionLocalization("de", "Sende eine Anfrage an die Moderatoren")
    .toJSON();
  public async run(
    client: DiscordClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const user = interaction.user;
    const msg = await user
      .send("Bitte schreiben Sie mir Ihre Anfrage in einer Nachricht:")
      .catch(async (reason) => {
        await interaction.reply(
          `Beim Senden der Nachricht ist ein Fehler aufgetreten: ${reason.toString()}`,
        );
        return;
      });
    if (!msg) return;
    await interaction.reply({
      content: "Sie haben eine neue Direktnachricht erhalten.",
      ephemeral: true,
    });
    if (!msg) return;
    const coll = msg.channel.createMessageCollector({
      max: 1,
      filter: (m) => m.author.id === interaction.member?.user.id,
    });
    coll.on("collect", async (m) => {
      m.channel.send("Vielen Dank für Ihre Anfrage!");
      if (!client.anfrageChannel)
        client.anfrageChannel =
          (await client.channels.fetch(config.discord.channels.anfrage)) ??
          undefined;
      if (
        !client.anfrageChannel ||
        !client.anfrageChannel.isTextBased() ||
        client.anfrageChannel.isDMBased()
      ) {
        logger.info(`Anfrage: ${m.author.tag}: ${m.content}`);
        logger.error("Der Anfrage Kanal ist kein Textkanal.");
        return;
      }
      if (m.content) {
        client.anfrageChannel.send(`${m.author.tag}: ${m.content}`);
      } else if (m.attachments) {
        const atts = [...m.attachments.values()];
        client.anfrageChannel.send({ content: m.author.tag, files: atts });
      }
    });
  }
})();

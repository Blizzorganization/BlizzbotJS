import { Aliases } from "$/db/Aliases";
import type DiscordClient from "$/modules/DiscordClient";
import { db } from "$/modules/db";
import type { ChatInputCommandInteraction } from "discord.js";

export async function addAlias(
  _client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  const alias = interaction.options.getString("name", true);
  const command = interaction.options.getString("command", true);
  await db.insert(Aliases).values({ command, name: alias });
  await interaction.reply(
    interaction.locale === "de"
      ? "Der Alias wurde erfolgreich hinzugefügt"
      : "The Alias was added.",
  );
}

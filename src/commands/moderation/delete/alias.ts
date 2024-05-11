import { Aliases } from "$/db/Aliases";
import type DiscordClient from "$/modules/DiscordClient";
import { db } from "$/modules/db";
import type { ChatInputCommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export async function deleteAlias(
  _client: DiscordClient,
  interaction: ChatInputCommandInteraction,
) {
  const aliasName = interaction.options.getString("name", true);
  await db.delete(Aliases).where(eq(Aliases.name, aliasName));
}

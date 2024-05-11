import type {
  CacheType,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import type DiscordClient from "./DiscordClient";
import type { permissions } from "./utils";

export abstract class Command {
  public abstract perm: (typeof permissions)[keyof typeof permissions];
  public abstract name: string;
  public abstract setup: RESTPostAPIChatInputApplicationCommandsJSONBody;
  public disabled = false;
  public abstract run(
    client: DiscordClient<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void>;
}

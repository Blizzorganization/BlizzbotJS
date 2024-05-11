import type { ClientEvents } from "discord.js";
import type DiscordClient from "./DiscordClient";

export abstract class EventListener<Event extends keyof ClientEvents> {
  public abstract readonly eventName: Event;
  public disabled = false;
  public once = false;
  abstract handle(
    client: DiscordClient,
    ...args: ClientEvents[Event]
  ): Promise<void>;
}

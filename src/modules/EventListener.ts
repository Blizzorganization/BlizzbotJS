import { Client, ClientEvents, Events } from "discord.js";

export abstract class EventListener<Event extends keyof ClientEvents> {
  public abstract eventName: Event;
  abstract handle(...args: ClientEvents[Event]): Promise<void>;
}

import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { EOL } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";
import { mcnames } from "$/db/mcnames";
import {
  type Channel,
  Client,
  Collection,
  IntentsBitField,
  Partials,
} from "discord.js";
import { and, isNotNull } from "drizzle-orm";
import type { Command } from "./command";
import { db } from "./db";
import ptero from "./ptero";
import { loadCommands, loadEvents } from "./utils";

interface WhitelistEntry {
  uuid: string;
  name: string;
}

class DiscordClient<Ready extends boolean = boolean> extends Client<Ready> {
  slashCommands: Collection<string, Command>;
  linkUsage: Collection<string, { ts: number; url: RegExpExecArray }[]>;
  blacklist: string[];
  welcomeTexts: string[];
  logChannel?: Channel;
  standardChannel?: Channel;
  anfrageChannel?: Channel;

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMessageReactions,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
      ],
    });
    this.slashCommands = new Collection<string, Command>();
    this.linkUsage = new Collection<
      string,
      { ts: number; url: RegExpExecArray }[]
    >();
    const base = new URL(import.meta.url);
    loadCommands(
      new URL("../commands/user", base).pathname,
      this.slashCommands,
    );
    loadCommands(
      new URL("../commands/moderation", base).pathname,
      this.slashCommands,
    );
    loadCommands(new URL("../commands/dev", base).pathname, this.slashCommands);
    loadEvents(this, new URL("../events", base).pathname);

    this.blacklist = readFileSync("configs/badwords.txt", "utf-8")
      .split(EOL)
      .filter((word) => word !== "");
    this.welcomeTexts = readFileSync("configs/welcome.txt", "utf-8")
      .split(EOL)
      .filter((word) => word !== "");
  }
  async syncWhitelist() {
    const mcusers = await db
      .select()
      .from(mcnames)
      .where(and(isNotNull(mcnames.mcId), isNotNull(mcnames.mcName)));
    const twitch: WhitelistEntry[] = mcusers
      .filter((usr) => usr.whitelistTwitch)
      // biome-ignore lint/style/noNonNullAssertion: checked via isNotNull query
      .map((usr) => ({ name: usr.mcName!, uuid: usr.mcId! }));
    const youtube: WhitelistEntry[] = mcusers
      .filter((usr) => usr.whitelistYoutube)
      // biome-ignore lint/style/noNonNullAssertion: checked via isNotNull query
      .map((usr) => ({ name: usr.mcName!, uuid: usr.mcId! }));
    const ytlist = JSON.stringify(youtube, undefined, 2);
    const twlist = JSON.stringify(twitch, undefined, 2);

    // create whitelistfolder and txt files
    if (!existsSync("whitelist")) mkdirSync("whitelist");
    if (!existsSync("whitelist/twitch")) mkdirSync("whitelist/twitch");
    if (!existsSync("whitelist/youtube")) mkdirSync("whitelist/youtube");
    for (const txtFile of ["paths", "pterodactyl"]) {
      appendFileSync(`whitelist/youtube/${txtFile}.txt`, "");
      appendFileSync(`whitelist/twitch/${txtFile}.txt`, "");
    }

    writeFileSync("whitelist/youtube/whitelist.json", ytlist);
    writeFileSync("whitelist/twitch/whitelist.json", twlist);
    const ytPaths = readFileSync("whitelist/youtube/paths.txt", "utf8")
      .split(EOL)
      .filter((path) => path !== "")
      .map((path) => join(path, "whitelist.json"));
    const twPaths = readFileSync("whitelist/twitch/paths.txt", "utf8")
      .split(EOL)
      .filter((path) => path !== "")
      .map((path) => join(path, "whitelist.json"));
    for (const path of ytPaths)
      copyFileSync("whitelist/youtube/whitelist.json", path);
    for (const path of twPaths)
      copyFileSync("whitelist/twitch/whitelist.json", path);
    const pteroYtFile = readFileSync(
      "whitelist/youtube/pterodactyl.txt",
      "utf8",
    )
      .split(EOL)
      .filter((path) => path !== "");
    const pteroTwFile = readFileSync("whitelist/twitch/pterodactyl.txt", "utf8")
      .split(EOL)
      .filter((path) => path !== "");
    for (const srv of pteroYtFile) {
      const [serverid, whitelistpath] = srv.split(" ");
      if (!serverid || !whitelistpath) return;
      ptero.writeFile(serverid, whitelistpath, ytlist);
    }
    for (const srv of pteroTwFile) {
      const [serverid, whitelistpath] = srv.split(" ");
      if (!serverid || !whitelistpath) return;
      ptero.writeFile(serverid, whitelistpath, twlist);
    }
  }
}

export default DiscordClient;

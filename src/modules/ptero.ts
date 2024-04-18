import { ClientServer, PteroClient } from "@devnote-dev/pterojs";
import logger from "./logger.js";
import { pterodactyl as pteroConf } from "./config.js";

export class Ptero {
  ptero: PteroClient;

  constructor() {
    this.ptero = new PteroClient(pteroConf.host, pteroConf.apiKey, {
      servers: { fetch: true, cache: true, max: true },
    });
    this.ptero.connect();
  }

  async writeFile(srvid: string, filepath: string, content: string) {
    const srv = await this.ptero.servers.fetch(srvid);
    if (!(srv instanceof ClientServer)) {
      logger.warn(`Server ${srvid} is not a client server.`);
      return;
    }
    logger.silly("writing file to pterodactyl server");
    srv.files.write(filepath, content);
    logger.silly("wrote file to pterodactyl server.");
  }
}
export default new Ptero();

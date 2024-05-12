import { ClientServer, PteroClient } from "@robertsspaceindustries/pterojs";
import config from "./config";
import logger from "./logger";

export class Ptero {
  #ptero: PteroClient;

  constructor() {
    this.#ptero = new PteroClient(
      config.pterodactyl.host,
      config.pterodactyl.apiKey,
      { servers: { fetch: true, cache: true } },
    );
    this.#ptero.connect();
  }

  async writeFile(srvid: string, filepath: string, content: string) {
    const srv = await this.#ptero.servers.fetch(srvid);
    if (!(srv instanceof ClientServer)) {
      logger.warning(`Server ${srvid} is not a client server.`);
      return;
    }
    logger.debug("writing file to pterodactyl server");
    srv.files.write(filepath, content);
    logger.debug("wrote file to pterodactyl server.");
  }
}
export default new Ptero();

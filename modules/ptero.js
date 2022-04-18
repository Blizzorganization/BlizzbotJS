import pkg from "@devnote-dev/pterojs";
import logger from "./logger.js";

const { PteroClient, ClientServer } = pkg;

export class Ptero {
    ptero;
    constructor(config) {
        this.ptero = new PteroClient(config.host, config.apiKey, { fetchServers: true, cacheServers: true });
        this.ptero.connect();
    }
    /**
     * @param {string} srvid
     * @param {string} filepath
     * @param {string} content
     */
    async writeFile(srvid, filepath, content) {
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

import pkg from "@devnote-dev/pterojs";

const { PteroApp } = pkg;

export class Ptero {
    #ptero;
    constructor(config) {
        this.#ptero = new PteroApp(config.host, config.apiKey, { fetchServers: true, cacheServers: true });
        this.#ptero.connect();
    }
    /**
     * @param {string} srvid
     * @param {string} filepath
     * @param {string} content
     */
    async writeFile(srvid, filepath, content) {
        const srv = await this.#ptero.servers.fetch(srvid);
        srv.files.write(filepath, content);
    }
}

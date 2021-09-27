import * as mysql from "mysql2";

class DB {
    #mysql
    /**
     * @param  {{host: string, port: number, password: string, database: string}} config
     */
    constructor(config) {
        this.#mysql = mysql.createPoolCluster(config);
    }

}
export default DB;
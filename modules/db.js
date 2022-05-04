import sequelize from "sequelize";
import logger from "./logger.js";

const { DataTypes, Model, Op, Sequelize } = sequelize;

/** @type {sequelize.Sequelize} */
let db;
class XPUser extends Model {
    get level() {
        // @ts-ignore
        return Math.floor(Math.sqrt(this.experience / 10));
    }
    async getPosition() {
        return await XPUser.count({
            // @ts-ignore
            distinct: "experience",
            where: {
                experience: {
                    // @ts-ignore
                    [Op.gte]: this.experience,
                },
            },
        });
    }
}
class MCUser extends Model {}
class CustomCommand extends Model {}
class Alias extends Model {}

/**
 *
 * @param {import("../typings/config")["blizzbot"]["database"]} config
 */
async function init(config) {
    db = new Sequelize({
        database: config.database,
        dialect: config.type,
        host: config.host,
        username: config.user,
        password: config.password,
        port: config.port,
        logging: (sql) => logger.debug(sql),
    });
    XPUser.init({
        discordId: DataTypes.BIGINT,
        guildId: DataTypes.BIGINT,
        experience: DataTypes.INTEGER,
        available: DataTypes.BOOLEAN,
        username: DataTypes.STRING,
    }, {
        sequelize: db,
        tableName: "ranking",
        paranoid: false,
    });
    MCUser.init({
        discordId: {
            primaryKey: true,
            type: DataTypes.BIGINT,
        },
        mcName: DataTypes.STRING,
        mcId: DataTypes.UUID,
        whitelistTwitch: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        whitelistYouTube: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize: db,
        tableName: "mcnames",
        paranoid: false,
    });
    CustomCommand.init({
        commandName: DataTypes.TEXT,
        response: DataTypes.TEXT,
        lastEditedBy: DataTypes.BIGINT,
    }, {
        sequelize: db,
        paranoid: false,
    });
    Alias.init({
        command: DataTypes.TEXT,
        name: DataTypes.TEXT,
        type: DataTypes.TEXT,
    }, {
        sequelize: db,
        paranoid: false,
    });
    await db.authenticate().catch((e) => {logger.error(e);});

    logger.info("Database connection successful.");
    await Alias.sync({ alter: true });
    await CustomCommand.sync({ alter: true });
    await MCUser.sync({ alter: true });
    await XPUser.sync({ alter: true });
}


export {
    Alias,
    CustomCommand,
    db,
    init,
    MCUser,
    XPUser,
};

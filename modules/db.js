import logger from "./logger.js";
import sequelize from "sequelize";

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
    });
    CustomCommand.init({
        commandName: DataTypes.TEXT,
        response: DataTypes.TEXT,
        lastEditedBy: DataTypes.BIGINT,
    }, {
        sequelize: db,
    });
    await db.authenticate().catch((e) => {logger.error(e);});

    logger.info("Database connection successful.");
    await XPUser.sync({ alter: true });
    await MCUser.sync({ alter: true });
    await CustomCommand.sync({ alter: true });
}


export {
    db,
    XPUser,
    MCUser,
    CustomCommand,
    init,
};
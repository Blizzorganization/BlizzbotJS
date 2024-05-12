import { config, createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const DEBUG = process.env.DEBUG ?? "0";

const logger = createLogger({
  levels: config.syslog.levels,
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: "blizzbot" },
  transports: [
    new transports.File({
      filename: "error.log",
      dirname: "logs",
      level: "error",
    }),
    new transports.DailyRotateFile({
      dirname: "logs",
      createSymlink: true,
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD_HH",
      zippedArchive: true,
      maxFiles: "14d",
      symlinkName: "latest.log",
    }),
  ],
});

logger.add(
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
    level: !["", "0"].includes(DEBUG) ? "debug" : "info",
  }),
);
if (!["", "0"].includes(DEBUG)) {
  logger.add(
    new transports.File({
      dirname: "logs",
      filename: "debug.log",
      level: "debug",
    }),
  );
}
process.on("uncaughtException", (error) => logger.error(error));

export default logger;
logger.info(`The current Loglevel is ${DEBUG}`);

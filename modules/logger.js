import "winston-daily-rotate-file";
import winston from "winston";

const { createLogger, format, transports } = winston;

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    defaultMeta: { service: "blizzbot" },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`.
        // - Write all logs error (and below) to `error.log`.
        //
        new transports.File({ filename: "error.log", dirname: "logs", level: "error" }),
        new transports.DailyRotateFile({ dirname: "logs", createSymlink: true, filename: "%DATE%.log", datePattern: "YYYY-MM-DD_HH", zippedArchive: true, maxFiles: "14d", symlinkName: "latest.log" }),
    ],
});

logger.add(new transports.Console({
    format: format.combine(
        format.colorize(),
        format.simple(),
    ),
}));
process.on("uncaughtException", error => logger.log("error", error));

export default logger;
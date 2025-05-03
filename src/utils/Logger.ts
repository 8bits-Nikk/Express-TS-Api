import winston from "winston";
import path from "path";
import fs from "fs";

// Create log directory structure
const rootDir = process.cwd();
const logDir = path.join(rootDir, "logs");
if (process.env.NODE_ENV !== "production" && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    request: 2,
    sql: 3,
    info: 4,
    http: 5,
    verbose: 6,
    debug: 7,
    silly: 8,
  },
  colors: {
    error: "red",
    warn: "yellow",
    request: "cyan",
    sql: "magenta",
    info: "green",
    http: "magenta",
    verbose: "blue",
    debug: "white",
    silly: "grey",
  },
};

// Apply colors
winston.addColors(customLevels.colors);

// Common log format for file and console transports
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message} ${
      stack ? "\n" + stack : ""
    }`;
  })
);

// Console log format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

const requestFilter = winston.format((info) => {
  return info.level === "request" ? info : false;
})();

const sqlFilter = winston.format((info) => {
  return info.level === "sql" ? info : false;
})();

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    // Console transport for all logs in non-production environments
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    }),
    // Error file log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: logFormat,
    }),
    // Request file log - only request level messages
    new winston.transports.File({
      filename: path.join(logDir, "request.log"),
      format: winston.format.combine(requestFilter, logFormat),
    }),
    // Sequelize file log - only sql level messages
    new winston.transports.File({
      filename: path.join(logDir, "sql.log"),
      format: winston.format.combine(sqlFilter, logFormat),
    }),
    // Combined file log for all logs (info and below)
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: logFormat,
    }),
  ],
});

export { logger };

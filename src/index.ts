import app from "./app";
import { logger } from "./utils/Logger";
import { tryCatch } from "./utils/TryCatch";
import sequelize from "./db/AppConnection";

async function main() {
  const { error } = await tryCatch(sequelize.authenticate());
  if (error) {
    logger.error(error);
    return;
  }
  logger.info("Connected to the database");
  // Server
  const SERVER_PORT = process.env.SERVER_PORT ?? 3000;
  app.listen(SERVER_PORT, () => {
    logger.info(`Server running on port ${SERVER_PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Health check: ${process.env.BASE_URL}/api/health`);
  });

  // Exit application on unhandled rejection
  process.on("unhandledRejection", (err: Error) => {
    logger.error("UNHANDLED REJECTION! Shutting down...");
    logger.error(err.name, err.message);
  });

  // Exit application on uncaught exception
  process.on("uncaughtException", (err: Error) => {
    logger.error("UNCAUGHT EXCEPTION! Shutting down...");
    logger.error(err.name, err.message);
  });
}

process.on("SIGINT", async () => {
  logger.error("SIGINT received! Shutting down...");
  const { error } = await tryCatch(sequelize.close());
  if (error) {
    logger.error(error);
  } else {
    logger.info("Database connection closed gracefully.");
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.error("SIGTERM received! Shutting down...");
  const { error } = await tryCatch(sequelize.close());
  if (error) {
    logger.error(error);
  } else {
    logger.info("Database connection closed gracefully.");
  }
  process.exit(0);
});

// Run the main function
main();

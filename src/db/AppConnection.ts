import { Sequelize } from "sequelize";
import { logger } from "../utils/Logger";

const databaseUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const sequelize = new Sequelize(databaseUrl, {
  logging: (msg) => logger.log("sql", msg),
});
sequelize.sync(); // Sync the database with the models
export default sequelize;

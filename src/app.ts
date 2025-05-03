import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";

import authRouter from "./routes/auth.route";
import healthRouter from "./routes/health.route";
import notFoundRouter from "./routes/notFound.route"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Request logger
app.use(requestLogger);
// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRouter);

// Health check
app.use("/api/health", healthRouter);

// 404
app.use(notFoundRouter);
// Global error handler (should be the LAST middleware)
app.use(errorHandler);

export default app;

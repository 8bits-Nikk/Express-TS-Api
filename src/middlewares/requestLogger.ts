import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/Logger";

/**
 * Middleware to log incoming requests and their corresponding responses.
 *
 * Logs the HTTP method, URL, client IP address, and response status code.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.log(
    "request",
    `Incoming - METHOD: [${req.method}] - URL: [${req.url}] - AGENT: [${
      req.headers["user-agent"]
    }] - IP: [${req.socket.remoteAddress}] - BODY: [${JSON.stringify(
      req.body
    )}]`
  );
  res.on("finish", () => {
    logger.log(
      "request",
      `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`
    );
  });

  next();
}

export default requestLogger;
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import StatusCodes from "../constants/StatusCodes";

const JWT_SECRET = process.env.JWT_SECRET ?? "my-secret-key";

/**
 * Express middleware to verify the JSON Web Token sent in the Authorization header.
 *
 * Extracts the token from the Authorization header, verifies it using the JWT_SECRET
 * environment variable, and adds the user ID to the request object if the token is valid.
 *
 * If the token is invalid, expired, or missing, it sends an HTTP 401 Unauthorized response
 * with an appropriate error message.
 */
function verifyToken(
  req: Request & { user?: string },
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(
      new ApiError(
        "Authorization header missing or invalid",
        StatusCodes.UNAUTHORIZED
      )
    );
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.sub && typeof decoded.sub === "string") {
      req.user = decoded.sub;
    }
    next();
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      next(new ApiError(error.message, StatusCodes.UNAUTHORIZED));
      return;
    }
    next(new ApiError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    return;
  }
}

export default verifyToken;

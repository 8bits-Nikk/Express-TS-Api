import fs from "fs";
import ApiError from "../utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/Logger";

/**
 * Express middleware to delete a file on error.
 *
 * If an error is passed to this middleware, it will delete the file
 * associated with the request if it exists.
 *
 * @param err - The error object passed from the previous middleware.
 * @param req - The Express request object.
 * @param _res - The Express response object (not used).
 * @param next - The next middleware function in the stack.
 */
export default function deleteFileOnError(
  err: ApiError | Error | null,
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!err) return next();
  if (req.file) {
    fs.unlinkSync(req.file.path);
  }

  next(err);
}

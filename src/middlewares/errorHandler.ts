import e, { NextFunction, Response, Request } from "express";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { logger } from "../utils/Logger";
import StatusCodes from "../constants/StatusCodes";
import {
  BaseError,
  ConnectionError,
  DatabaseError,
  EmptyResultError,
  ForeignKeyConstraintError,
  TimeoutError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";
import _ from "lodash";

/**
 * Express middleware to handle errors throughout the application.
 *
 * Differentiates between Sequelize BaseErrors, custom ApiErrors, and generic
 * JavaScript Errors, formatting them appropriately for API responses.
 *
 * If the error is a BaseError, it will be handled by `handleSequelizeError`.
 * If the error is an ApiError, it will respond with the status and message
 * from the ApiError. For all other errors, it defaults to a 500 Internal
 * Server Error with a generic message unless running in a development
 * environment, where the actual error message is exposed.
 *
 * Logs all errors using the application's logger.
 *
 * @param error - The error object, which can be an instance of Error, ApiError, or BaseError.
 * @param _req - The Express request object (unused).
 * @param res - The Express response object used to send the error response.
 * @param _next - The next middleware function in the stack (unused).
 */

export default function errorHandler(
  error: Error | ApiError | BaseError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof BaseError) {
    const sqlError = handleSequelizeError(error);
    res
      .status(sqlError.statusCode)
      .json(ApiResponse.fail(sqlError));
    logger.error(sqlError);
    return;
  }

  if (error instanceof ApiError) {
    res
      .status(error.statusCode)
      .json(ApiResponse.fail(error));
    logger.error(error);
    return;
  }
  const errorMessage =
    process.env.NODE_ENV === "dev" ? error.message : "Internal Server Error";
  const apiError = new ApiError(
    errorMessage,
    StatusCodes.INTERNAL_SERVER_ERROR
  );
  res
    .status(apiError.statusCode)
    .json(ApiResponse.fail(apiError));
  logger.error(apiError);
}

function formateMessage(errorArray: Array<{ message: string }>) {
  const errorMEssage = _.map(errorArray, (e) => e.message);
  return _.join(errorMEssage, ", ");
}

/**
 * Handles Sequelize BaseErrors and maps them to appropriate ApiError instances.
 *
 * This function inspects the type of Sequelize BaseError and returns an ApiError
 * with a corresponding HTTP status code and message. For validation-related errors,
 * it formats the error messages into a single string. Other errors are mapped to
 * an internal server error by default.
 *
 * @param err - An instance of a Sequelize BaseError to be handled.
 * @returns An ApiError instance with a formatted message and HTTP status code.
 */

function handleSequelizeError(err: BaseError) {
  switch (true) {
    case err instanceof ValidationError:
      return new ApiError(formateMessage(err.errors), StatusCodes.BAD_REQUEST);
    case err instanceof UniqueConstraintError:
      return new ApiError(formateMessage(err.errors), StatusCodes.CONFLICT);
    case err instanceof ForeignKeyConstraintError:
    case err instanceof DatabaseError:
    case err instanceof ConnectionError:
    case err instanceof TimeoutError:
    case err instanceof EmptyResultError:
      return new ApiError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    default:
      return new ApiError(err.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

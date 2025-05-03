import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import StatusCodes from "../constants/StatusCodes";
import { tryCatch } from "../utils/TryCatch";
import ApiError from "../utils/ApiError";
import _ from "lodash";

/**
 * Middleware to validate the request body against a given Zod schema.
 *
 * @param schema - The Zod schema to validate the request body against.
 *
 * Returns an asynchronous middleware function that attempts to parse
 * the request body using the provided schema. If parsing fails, it
 * constructs an ApiError with the validation errors and passes it to
 * the next middleware. If parsing succeeds, it assigns the parsed
 * data back to `req.body`.
 *
 * @returns An async function taking Express's `req`, `_res`, and `next`
 * as parameters.
 */

const validateBody = (schema: AnyZodObject, fileFiledName?: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const { data, error } = await tryCatch<any, ZodError>(
      schema.parseAsync(req.body)
    );
    if (error) {
      let apiError: ZodError | ApiError = error;
      if (error instanceof ZodError) {
        const errorMEssage = _.map(error.errors, (e) => e.message);
        const formattedErrors = _.join(errorMEssage, ", ");
        apiError = new ApiError(formattedErrors, StatusCodes.BAD_REQUEST);
      }
      next(apiError);
      return;
    }
    if (fileFiledName && !req.file) {
      next(
        new ApiError(`${fileFiledName} is required`, StatusCodes.BAD_REQUEST)
      );
    } else {
      req.body = data;
      next();
    }
  };
};

export default validateBody;

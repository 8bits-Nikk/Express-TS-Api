import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import User from "../models/User.model";
import ApiResponse from "../utils/ApiResponse";
import { tryCatch } from "../utils/TryCatch";
import authService from "../services/auth.service";
import StatusCodes from "../constants/StatusCodes";
import ApiError from "../utils/ApiError";
import { logger } from "../utils/Logger";
import { createAccessToken, createRefreshToken } from "../utils/utils";
import { RequestWithUser } from "../types/tokenType";

/**
 * Handles a request to register a user.
 *
 * It expects the request body to have the user's email, password, and full name.
 * It returns a user response object with the user's details if successful.
 *
 * @param req - The Express request object containing the user's credentials.
 * @param res - The Express response object used to send the registration response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If the registration credentials are invalid or if another error occurs.
 */
async function register(req: Request, res: Response, next: NextFunction) {
  logger.debug("Registering user");
  logger.debug(req);
  const { data, error } = await tryCatch(
    authService.registerUser(req.body, req.file!)
  );
  if (error) return next(error);
  const response = {
    user: data,
    meta: {
      accessToken: createAccessToken(data.id),
      refreshToken: createRefreshToken(data.id),
    },
  };
  res
    .status(StatusCodes.CREATED)
    .json(
      ApiResponse.success(
        response,
        "User registered successfully!. Please verify your email.",
        StatusCodes.CREATED
      )
    );
}

/**
 * Handles a request to log in a user.
 *
 * It expects the request body to have the user's email and password.
 * It returns a user response object with the user's details if successful.
 *
 * @param req - The Express request object containing the user's credentials.
 * @param res - The Express response object used to send the login response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If the login credentials are invalid or if another error occurs.
 */
async function login(req: Request, res: Response, next: NextFunction) {
  const { data, error } = await tryCatch(authService.loginUser(req.body));
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  const response = {
    user: data,
    meta: {
      accessToken: createAccessToken(data.id),
      refreshToken: createRefreshToken(data.id),
    },
  };
  res.status(StatusCodes.OK).json(ApiResponse.success(response));
}

/**
 * Handles a request to send an OTP email to a user.
 *
 * It expects the request body to have the user's email.
 * It returns a success response with a message if successful.
 *
 * @param req - The Express request object containing the user's email.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If an error occurs while sending the OTP email.
 */
async function sendOTPEmail(req: Request, res: Response, next: NextFunction) {
  const { data, error } = await tryCatch(authService.sendOTPEmail(req.body));
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  res.status(StatusCodes.OK).json(ApiResponse.success(data));
}

/**
 * Handles a request to verify a user's email using the given OTP.
 *
 * It expects the request body to have the user's email and OTP.
 * It returns a success response with a message if successful.
 *
 * @param req - The Express request object containing the user's OTP.
 * @param res - The Express response object used to send the verification response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If an error occurs while verifying the email.
 */
async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  const { data, error } = await tryCatch(authService.verifyEmail(req.body));
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  res.status(StatusCodes.OK).json(ApiResponse.success(data));
}

/**
 * Handles a request to refresh a user's access token using the given refresh token.
 *
 * It expects the request body to have the user's refresh token.
 * It returns a success response with the new access token and refresh token if successful.
 *
 * @param req - The Express request object containing the user's refresh token.
 * @param res - The Express response object used to send the refresh response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If an error occurs while refreshing the access token.
 */
async function refreshToken(req: Request, res: Response, next: NextFunction) {
  const { data, error } = await tryCatch(authService.refreshToken(req.body));
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  res.status(StatusCodes.OK).json(ApiResponse.success(data));
}

/**
 * Handles a request to send a password reset email to a user.
 *
 * It expects the request body to have the user's email.
 * It returns a success response with a message if successful.
 *
 * @param req - The Express request object containing the user's email.
 * @param res - The Express response object used to send the response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If an error occurs while sending the password reset email.
 */
async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const { data, error } = await tryCatch(authService.forgotPassword(req.body));
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  res.status(StatusCodes.OK).json(ApiResponse.success(data));
}

/**
 * Handles a request to change a user's password.
 *
 * It expects the request body to have the old and new passwords.
 * It returns a success response with a message if successful.
 *
 * @param req - The Express request object containing the user's old and new passwords.
 * @param res - The Express response object used to send the change password response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If an error occurs while changing the password.
 */
async function changePassword(
  request: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const { data, error } = await tryCatch(
    authService.changePassword(request.body, request.user)
  );
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  res.status(StatusCodes.OK).json(ApiResponse.success(data));
}

/**
 * Handles a request to reset a user's password using the provided token and new password.
 *
 * It expects the request body to contain the new password details.
 * It returns a success response with a message if the password reset is successful.
 *
 * @param request - The Express request object containing the user's token and new password details.
 * @param res - The Express response object used to send the password reset response.
 * @param next - The next middleware function in the stack.
 *
 * @throws {ApiError} If an error occurs while resetting the password.
 */

async function resetPassword(
  request: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const { data, error } = await tryCatch(
    authService.resetPassword(request.body, request.user)
  );
  if (error instanceof ApiError) {
    res.status(StatusCodes.OK).json(ApiResponse.fail(error));
    return;
  }
  if (error) return next(error);
  res.status(StatusCodes.OK).json(ApiResponse.success(data));
}

export default {
  register,
  login,
  sendOTPEmail,
  verifyEmail,
  refreshToken,
  forgotPassword,
  changePassword,
  resetPassword,
};

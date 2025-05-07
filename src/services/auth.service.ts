import fs from "fs";
import jwt from "jsonwebtoken";
import StatusCodes from "../constants/StatusCodes";
import User from "../models/User.model";
import {
  LoginSchema,
  userResponseSchema,
  RegisterSchema,
  SendEmailOtpSchema,
  VerifyEmailSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from "../schema/auth.schema";
import ApiError from "../utils/ApiError";
import { logger } from "../utils/Logger";
import { tryCatch } from "../utils/TryCatch";
import {
  createAccessToken,
  createRefreshToken,
  hashPassword,
  verifyPassword,
} from "../utils/utils";
import otpService from "./otp.service";
import emailService from "./email.service";
import Otp from "../models/Otp.model";

/**
 * Handles a request to register a new user.
 *
 * It expects the request body to have the user's details, such as name, email, password, etc.
 * It expects the request to have a file field named "profileImage".
 *
 * @param body - The RegisterSchema object containing the user's details.
 * @param file - The Express.Multer.File object containing the uploaded file.
 *
 * @returns A Promise resolving to a user response object with the user's details.
 *
 * @throws {ApiError} If the user already exists.
 * @throws {ApiError} If any of the input fields are invalid.
 */
async function registerUser(body: RegisterSchema, file: Express.Multer.File) {
  logger.debug("Registering user");
  const user = {
    fullName: body.fullName,
    email: body.email,
    password: hashPassword(body.password),
    profileImage: file.filename,
  };
  const { data, error: findError } = await tryCatch(
    User.findOne({ where: { email: body.email } })
  );
  if (findError) throw findError;
  if (!data) {
    const { data: createdUser, error: createError } = await tryCatch(
      User.create(user)
    );
    if (createError) throw createError;
    return userResponseSchema.parse(createdUser);
  }
  if (!data.emailVerifiedAt) {
    fs.unlinkSync(file.path);
    return userResponseSchema.parse(data);
  }
  throw new ApiError("User already exists", StatusCodes.CONFLICT);
}

/**
 * Handles a request to log in a user.
 *
 * It expects the request body to have the user's email and password.
 * It returns a user response object with the user's details.
 *
 * @param body - The LoginSchema object containing the user's email and password.
 *
 * @returns A Promise resolving to a user response object with the user's details.
 *
 * @throws {ApiError} If the user is not found or the credentials are invalid.
 * @throws {ApiError} If the user's email is not verified.
 */
async function loginUser(body: LoginSchema) {
  logger.debug("Logging in user");
  const { data, error } = await tryCatch(
    User.findOne({ where: { email: body.email } })
  );
  if (error) throw error;
  if (!data) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }
  const isPasswordCorrect = verifyPassword(body.password, data.password);
  if (!isPasswordCorrect) {
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }
  const isEmailVerified = data.emailVerifiedAt !== null;
  if (!isEmailVerified) {
    throw new ApiError("Email not verified", StatusCodes.UNAUTHORIZED);
  }
  return userResponseSchema.parse(data);
}

/**
 * Handles a request to send an OTP email to a user.
 *
 * It expects the request body to have the user's email.
 * It returns a success response with a message if successful.
 *
 * @param params - The SendEmailOtpSchema object containing the user's email.
 *
 * @returns A Promise resolving to an object with a message.
 *
 * @throws {ApiError} If the user is not found.
 * @throws {ApiError} If the user's email is already verified.
 */
async function sendOTPEmail(params: SendEmailOtpSchema) {
  logger.debug("Sending OTP email");
  const { data, error } = await tryCatch(
    User.findOne({ where: { email: params.email } })
  );
  if (error) throw error;
  if (!data) {
    throw new ApiError("User not found with this email", StatusCodes.NOT_FOUND);
  }
  if (data.emailVerifiedAt) {
    throw new ApiError("Email already verified", StatusCodes.BAD_REQUEST);
  }
  const { data: otpData, error: otpError } = await tryCatch(
    otpService.createOtp(data.id, data.email)
  );
  if (otpError) throw otpError;
  // const { error: emailError } = await tryCatch(
  //   emailService.sendOTPEmail(data.email, otpData.otp)
  // );
  // if (emailError) throw emailError;
  return {
    message: "OTP sent successfully",
    otp: otpData.otp, // remove in production
  };
}

/**
 * Verifies the provided OTP for the given email and updates the user's email verification status.
 *
 * @param param - The VerifyEmailSchema object containing the user's email and OTP.
 *
 * @returns A Promise resolving to an object with a success message if the verification is successful.
 *
 * @throws {ApiError} If the OTP verification fails or if the user update fails.
 */
async function verifyEmail(param: VerifyEmailSchema) {
  logger.debug("Verifying email");
  const { data: otpData, error: otpError } = await tryCatch(
    otpService.verifyOtp(param.email, param.otp)
  );
  if (otpError) throw otpError;
  const { error: userError } = await tryCatch(
    User.update(
      { emailVerifiedAt: new Date() },
      { where: { id: otpData.userId } }
    )
  );
  if (userError) throw userError;
  await Otp.destroy({ where: { userId: otpData.userId } });
  return {
    message: "Email verified successfully",
  };
}

/**
 * Handles a request to refresh the access token using the given refresh token.
 *
 * It expects the request body to have the refresh token.
 * It returns a Promise resolving to an object with the new access token and refresh token.
 *
 * @param param - The RefreshTokenSchema object containing the refresh token.
 *
 * @returns A Promise resolving to an object with the new access token and refresh token.
 *
 * @throws {ApiError} If the refresh token is invalid or has expired.
 */
async function refreshToken(param: RefreshTokenSchema) {
  const JWT_SECRET = process.env.JWT_SECRET_REFRESH ?? "my-refresh-secret-key";
  try {
    const decoded = jwt.verify(param.refreshToken, JWT_SECRET);
    if (decoded.sub && typeof decoded.sub === "string") {
      return {
        accessToken: createAccessToken(decoded.sub),
        refreshToken: createRefreshToken(decoded.sub),
      };
    }
  } catch (error) {
    throw new ApiError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }
}

/**
 * Handles a request to send a password reset link to the given email.
 *
 * It expects the request body to have the email.
 * It returns a Promise resolving to an object with a success message and the password reset link.
 *
 * @param param - The ForgotPasswordSchema object containing the email.
 *
 * @returns A Promise resolving to an object with a success message and the password reset link.
 *
 * @throws {ApiError} If the user is not found or if the email sending fails.
 */
async function forgotPassword(param: ForgotPasswordSchema) {
  const { data, error } = await tryCatch(
    User.findOne({ where: { email: param.email } })
  );
  if (error) throw error;
  if (!data) {
    throw new ApiError(
      "Not Account Found with this email",
      StatusCodes.NOT_FOUND
    );
  }
  if (!data.emailVerifiedAt) {
    throw new ApiError("Email not verified", StatusCodes.UNAUTHORIZED);
  }
  const token = createAccessToken(data.id);
  const url = `${process.env.BASE_URL}/reset-password?token=${token}`;
  // const { error: emailError } = await tryCatch(
  //   emailService.sendResetPasswordLink(data.email, url)
  // );
  // if (emailError) throw emailError;
  return {
    message: "Password reset link sent successfully",
    link: url, // remove in production
  };
}

/**
 * Resets the password for a user identified by the provided user ID.
 *
 * It expects the request body to contain the new password details.
 * It hashes the new password and updates the user's password in the database.
 * Returns a success message if the password reset is successful.
 *
 * @param param - The ResetPasswordSchema object containing the new password.
 * @param userId - The ID of the user whose password is to be reset.
 *
 * @returns An object with a success message if the password reset is successful.
 *
 * @throws {ApiError} If the user is not found.
 * @throws {ApiError} If there is an error updating the user's password.
 */

async function resetPassword(
  param: ResetPasswordSchema,
  userId: string | undefined
) {
  if (userId) {
    const newPassword = hashPassword(param.password);
    const { error: userError } = await tryCatch(
      User.update({ password: newPassword }, { where: { id: userId } })
    );
    if (userError) throw userError;
    return {
      message: "Password reset successfully",
    };
  } else {
    throw new ApiError(
      "Not Account Found with this email",
      StatusCodes.NOT_FOUND
    );
  }
}

/**
 * Changes the password for a user identified by the provided user ID.
 *
 * It expects the request body to contain the old and new password details.
 * It verifies the old password, hashes the new password and updates the user's password in the database.
 * Returns a success message if the password change is successful.
 *
 * @param param - The ChangePasswordSchema object containing the old and new password.
 * @param userId - The ID of the user whose password is to be changed.
 *
 * @returns An object with a success message if the password change is successful.
 *
 * @throws {ApiError} If the user is not found.
 * @throws {ApiError} If the old password is invalid.
 * @throws {ApiError} If there is an error updating the user's password.
 */
async function changePassword(
  param: ChangePasswordSchema,
  userId: string | undefined
) {
  if (userId) {
    const { data, error } = await tryCatch(
      User.findOne({ where: { id: userId } })
    );
    if (error) throw error;
    if (!data) {
      throw new ApiError(
        "Not Account Found with this email",
        StatusCodes.NOT_FOUND
      );
    }

    const password = verifyPassword(param.password, data.password);
    if (!password) {
      throw new ApiError("Invalid password", StatusCodes.BAD_REQUEST);
    }

    const newPassword = hashPassword(param.newPassword);
    if (newPassword === data.password) {
      throw new ApiError(
        "New password cannot be same as old password",
        StatusCodes.BAD_REQUEST
      );
    }
    const { error: userError } = await tryCatch(
      User.update({ password: newPassword }, { where: { id: userId } })
    );
    if (userError) throw userError;
    return {
      message: "Password reset successfully",
    };
  } else {
    throw new ApiError(
      "Not Account Found with this email",
      StatusCodes.NOT_FOUND
    );
  }
}

export default {
  registerUser,
  loginUser,
  sendOTPEmail,
  verifyEmail,
  refreshToken,
  forgotPassword,
  changePassword,
  resetPassword,
};

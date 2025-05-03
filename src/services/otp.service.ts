import { Op } from "sequelize";
import Otp from "../models/Otp.model";
import { tryCatch } from "../utils/TryCatch";
import ApiError from "../utils/ApiError";
import StatusCodes from "../constants/StatusCodes";
import { generateOTP, hashPassword, verifyPassword } from "../utils/utils";

const OTP_EXPIRATION_MINUTES = 10;
const OTP_RATE_LIMIT_WINDOW_MINUTES = 60;
const MAX_OTP_PER_WINDOW = 3;

/**
 * Creates a new OTP for the given user and email.
 *
 * This function will not create a new OTP if the user has exceeded the rate limit
 * of MAX_OTP_PER_WINDOW within the last OTP_RATE_LIMIT_WINDOW_MINUTES minutes.
 *
 * @param userId - The ID of the user to create the OTP for.
 * @param email - The email address to associate the OTP with.
 *
 * @returns The created OTP.
 *
 * @throws {ApiError} If the user has exceeded the rate limit.
 */
async function createOtp(userId: string, email: string) {
  const windowStart = new Date(
    Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60000
  );
  const { data: otpCount, error } = await tryCatch(
    Otp.count({
      where: {
        userId,
        createdAt: { [Op.gt]: windowStart },
      },
    })
  );
  if (error) throw error;
  if (otpCount >= MAX_OTP_PER_WINDOW) {
    throw new ApiError("Rate limit exceeded", StatusCodes.TOO_MANY_REQUESTS);
  }
  const otp = generateOTP();
  const { data: createdOtp, error: createError } = await tryCatch(
    Otp.create({
      email,
      userId,
      otp: hashPassword(otp, 16, 4),
    })
  );
  if (createError) throw createError;
  return { ...createdOtp, otp };
}

/**
 * Verifies a given OTP for the given email.
 *
 * @param email - The email address that the OTP was sent to.
 * @param otp - The OTP to verify.
 *
 * @returns The OTP object if the OTP is valid, otherwise throws an error.
 *
 * @throws {ApiError} If the OTP is invalid or has expired.
 */
async function verifyOtp(email: string, otp: string) {
  const { data, error } = await tryCatch(
    Otp.findOne({
      where: {
        email,
        createdAt: {
          [Op.gt]: new Date(Date.now() - OTP_EXPIRATION_MINUTES * 60000),
        },
      },
      order: [["createdAt", "DESC"]],
    })
  );
  if (error) throw error;
  if (data && verifyPassword(otp, data.otp, 16)) {
    return data;
  }
  throw new ApiError("Invalid OTP", StatusCodes.UNAUTHORIZED);
}

export default {
  createOtp,
  verifyOtp,
};

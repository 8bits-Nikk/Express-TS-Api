import { z } from "zod";
import { generateProfileUrl } from "../utils/utils";
import e from "express";

export const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email address",
    }),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, {
      message: "Password must be at least 8 characters",
    })
    .max(16, {
      message: "Password must be at most 16 characters",
    }),
  fullName: z
    .string({
      required_error: "Full name is required",
      invalid_type_error: "Full name must be a string",
    })
    .min(3, {
      message: "Full name must be at least 3 characters",
    }),
});

export const userResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  profileImage: z.string().transform(generateProfileUrl),
  createdAt: z.date(),
  updatedAt: z.date(),
  emailVerifiedAt: z.date().nullable(),
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, {
      message: "Password must be at least 8 characters",
    })
    .max(16, {
      message: "Password must be at most 16 characters",
    }),
});

export const sendEmailOtpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email address",
    }),
});

export const verifyEmailSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email address",
    }),
  otp: z
    .string({
      required_error: "OTP is required",
      invalid_type_error: "OTP must be a string",
    })
    .length(4, {
      message: "OTP must be 4 digits",
    }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({
    required_error: "Refresh token is required",
    invalid_type_error: "Refresh token must be a string",
  }),
});

// Types
export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type UserResponseSchema = z.infer<typeof userResponseSchema>;
export type SendEmailOtpSchema = z.infer<typeof sendEmailOtpSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;
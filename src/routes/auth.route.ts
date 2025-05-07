import express from "express";
import validateBody from "../middlewares/validateBody";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  sendEmailOtpSchema,
  verifyEmailSchema,
} from "../schema/auth.schema";
import uploadService from "../services/upload.service";
import authController from "../controllers/auth.controller";
import deleteFileOnError from "../middlewares/deleteFileOnError";
import verifyToken from "../middlewares/verifyToken";

const authRouter = express.Router();

authRouter.post(
  "/register",
  uploadService.uploadProfile(),
  validateBody(registerSchema, "profileImage"),
  authController.register,
  deleteFileOnError
);

authRouter.post("/login", validateBody(loginSchema), authController.login);

authRouter.post(
  "/send-otp",
  validateBody(sendEmailOtpSchema),
  authController.sendOTPEmail
);

authRouter.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  authController.verifyEmail
);

authRouter.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

authRouter.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

authRouter.post(
  "/reset-password",
  verifyToken,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

authRouter.post(
  "/change-password",
  verifyToken,
  validateBody(changePasswordSchema),
  authController.changePassword
);

export default authRouter;

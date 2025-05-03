import express from "express";
import validateBody from "../middlewares/validateBody";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
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

// TODO
authRouter.post("/forgot-password", verifyToken, (req, res) => {
  res.status(200).json({
    message: "success",
  });
});

authRouter.post("/reset-password", (req, res) => {});

export default authRouter;

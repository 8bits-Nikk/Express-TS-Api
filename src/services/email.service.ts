import nodemailer from "nodemailer";
import { tryCatch } from "../utils/TryCatch";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "",
  port: parseInt(process.env.SMTP_PORT ?? ""),
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOTPEmail(email: string, otp: string) {
  const htmlContent = `
  <div
      style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 40px 20px;
      "
    >
      <div
        style="
          max-width: 600px;
          margin: auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        "
      >
        <h2 style="color: #e30613;">Verify your email</h2>
        <p style="font-size: 16px; color: #333333">
          Please use this otp to verify your account
        </p>
        <h1 style="color: #e30613; text-align: center; letter-spacing: 5px">
          ${otp}
        </h1>
        <p style="font-size: 14px; color: #777777">
          If you didn’t request this, you can safely ignore this email.
        </p>
        <hr
          style="margin: 30px 0; border: none; border-top: 1px solid #dddddd"
        />
        <p style="font-size: 12px; color: #aaaaaa; text-align: center">
          © ${new Date().getFullYear()} [App Name]. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = `
  Hello,
        Verify your email
        Please use this otp to verify your account: ${otp}
        If you didn’t request this, you can safely ignore this email.
    Thank you
    © ${new Date().getFullYear()} [App Name]. All rights reserved.
`;
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    priority: "high",
    sender: process.env.FROM_EMAIL,
    subject: "[App Name] Verify your email",
    html: htmlContent,
    text: textContent,
  };
  const { data, error } = await tryCatch(transporter.sendMail(mailOptions));
  if (error) throw error;
  return data;
}

  /**
   * Sends a password reset email to the given email address.
   *
   * This function expects the request body to have the user's email.
   * It returns a success response with a message if successful.
   *
   * @param email - The email address to send the password reset link to.
   * @param url - The password reset link to include in the email.
   *
   * @returns A Promise resolving to an object with a success message if the email is sent successfully.
   *
   * @throws {ApiError} If an error occurs while sending the password reset email.
   */
async function sendResetPasswordLink(email: string, url: string) {
  const htmlContent = `
  <div
      style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 40px 20px;
      "
    >
      <div
        style="
          max-width: 600px;
          margin: auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        "
      >
        <h2 style="color: #e30613;">Reset your password</h2>
        <p style="font-size: 16px; color: #333333">
          Click on the link below to reset your password
        </p>
        <a href="${url}" style="color: #e30613; text-align: center;">
          Reset Password
        </a>
        <p style="font-size: 14px; color: #777777">
          If you didn’t request this, you can safely ignore this email.
        </p>
        <hr
          style="margin: 30px 0; border: none; border-top: 1px solid #dddddd"
        />
        <p style="font-size: 12px; color: #aaaaaa; text-align: center">
          © ${new Date().getFullYear()} [App Name]. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = `
  Hello,
        Reset your password
        Click on the link below to reset your password: ${url}
        If you didn’t request this, you can safely ignore this email.
    Thank you
    © ${new Date().getFullYear()} [App Name]. All rights reserved.
`;
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    priority: "high",
    sender: process.env.FROM_EMAIL,
    subject: "[App Name] Reset your password",
    html: htmlContent,
    text: textContent,
  };
  const { data, error } = await tryCatch(transporter.sendMail(mailOptions));
  if (error) throw error;
  return data;
}

export default {
  sendOTPEmail,
  sendResetPasswordLink,
};

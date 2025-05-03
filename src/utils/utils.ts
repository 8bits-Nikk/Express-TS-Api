import jwt from "jsonwebtoken";
import ms from "ms";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
/**
 * Hash a password using scrypt.
 *
 * @param password the password to hash
 * @param keylen the length of the key for the scrypt algorithm, defaults to 64
 * @param saltLen the length of the salt for the scrypt algorithm, defaults to 16
 * @returns a string in the format "salt:hashedPassword" which can be stored in a database
 */
export function hashPassword(
  password: string,
  keylen: number = 64,
  saltLen: number = 16
) {
  const salt = randomBytes(saltLen).toString("hex");
  const hashedPassword = scryptSync(password, salt, keylen).toString("hex");
  return `${salt}:${hashedPassword}`;
}

/**
 * Verify a password against a hashed password.
 *
 * @param password the password to verify
 * @param hashedPassword the hashed password to compare against
 * @param keylen the length of the key for the scrypt algorithm, defaults to 64
 * @returns true if the password matches the hashed password, false otherwise
 */
export function verifyPassword(
  password: string,
  hashedPassword: string,
  keylen: number = 64
) {
  const [salt, storedHash] = hashedPassword.split(":");
  const hash = scryptSync(password, salt, keylen);
  const storedHashBuffer = Buffer.from(storedHash, "hex");
  const match = timingSafeEqual(hash, storedHashBuffer);
  return match;
}

/**
 * Generates a profile URL from a given profile image path.
 *
 * The profile image path should be an absolute path. This function will
 * remove the absolute path and only use the relative path to generate
 * the URL.
 *
 * For example, if process.env.BASE_URL is 'http://example.com' and
 * the profile image path is '/uploads/profile-image.jpg', the generated
 * URL will be 'http://example.com/uploads/profile-image.jpg'.
 *
 * @param profileImage - The profile image path.
 * @returns The profile URL.
 */
export function generateProfileUrl(profileImage: string) {
  const fullPath = `${process.env.BASE_URL}/uploads/profile/${profileImage}`;
  return encodeURI(fullPath);
}

/**
 * Generates a 4-digit OTP (One-Time Password) as a string.
 *
 * The OTP is a randomly generated 4-digit number between 1000 and 9999.
 *
 * @returns A string representing the 4-digit OTP.
 */

export function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generates a JSON Web Token (JWT) for access purposes.
 *
 * This function creates an access token for the specified user ID
 * using the HS256 algorithm. The token includes a type, expiry time,
 * unique identifier, issuer, audience, and subject.
 *
 * @param userId - The ID of the user for whom the access token is being created.
 * @returns A signed JWT string for access authentication.
 */

export function createAccessToken(userId: string) {
  const JWT_SECRET = process.env.JWT_SECRET ?? "my-secret-key";
  const EXPIRES_IN = (process.env.EXPIRES_IN ?? "10m") as ms.StringValue;

  return jwt.sign({ typ: "Access" }, JWT_SECRET, {
    expiresIn: EXPIRES_IN,
    jwtid: crypto.randomUUID(),
    algorithm: "HS256",
    issuer: "nikhilmakwana.in",
    audience: "[App Name]",
    subject: userId,
  });
}

/**
 * Generates a JSON Web Token (JWT) for refresh purposes.
 *
 * This function creates a refresh token for the specified user ID
 * using the HS256 algorithm. The token includes a type, expiry time,
 * unique identifier, issuer, audience, and subject.
 *
 * @param userId - The ID of the user for whom the refresh token is being created.
 * @returns A signed JWT string for refresh authentication.
 */

export function createRefreshToken(userId: string) {
  const JWT_SECRET = process.env.JWT_SECRET_REFRESH ?? "my-refresh-secret-key";
  const EXPIRES_IN = (process.env.EXPIRES_IN_REFRESH ?? "20m") as ms.StringValue;

  return jwt.sign({ typ: "Refresh" }, JWT_SECRET, {
    expiresIn: EXPIRES_IN,
    jwtid: crypto.randomUUID(),
    algorithm: "HS256",
    issuer: "nikhilmakwana.in",
    audience: "[App Name]",
    subject: userId,
  });
}

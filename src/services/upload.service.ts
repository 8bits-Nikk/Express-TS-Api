import { Request } from "express";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import ApiError from "../utils/ApiError";
import { randomUUID } from "crypto";
import { logger } from "../utils/Logger";

const rootDir = process.cwd();
const uploadDir = path.join(rootDir, "uploads");

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = file.fieldname;
    if (folder === "profileImage") {
      const profileDir = path.join(uploadDir, "profile");
      fs.mkdirSync(profileDir, { recursive: true });
      cb(null, profileDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const fileName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new ApiError("Only .png, .jpg and .jpeg format allowed!", 400));
  }
};

/**
 * Returns a multer middleware for uploading a profile image.
 *
 * The middleware will store the file in the "uploads/profile" directory
 * and only allow .png, .jpg, and .jpeg format with a maximum size of 1
 * megabyte.
 *
 * @returns A multer middleware for uploading a profile image.
 */
const uploadMulter = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 1, fieldNameSize: 32 }, // 1 MB
});
function uploadProfile() {
  logger.debug("Uploading file..");
  return uploadMulter.single("profileImage");
}

export default {
  uploadProfile,
};

import { mkdirSync } from "node:fs";
import multer from "multer";
import { getEnvVar } from "../getEnvVar.js";

class UploadFormatError extends Error {}

const UPLOAD_DIR = getEnvVar("UPLOAD_DIR", false) || "uploads";
mkdirSync(UPLOAD_DIR, { recursive: true });

function getAllowedExtension(file) {
  if (file.fieldname === "image") {
    if (file.mimetype === "image/png") return "png";
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") return "jpg";
    if (file.mimetype === "image/webp") return "webp";
    throw new UploadFormatError("Unsupported image type");
  }

  if (file.fieldname === "pdf") {
    if (file.mimetype === "application/pdf") return "pdf";
    throw new UploadFormatError("Unsupported PDF type");
  }

  throw new UploadFormatError("Unexpected upload field");
}

const storageEngine = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },

  filename(req, file, cb) {
    try {
      const ext = getAllowedExtension(file);
      const fileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      cb(null, fileName);
    } catch (err) {
      cb(err, "");
    }
  },
});

function fileFilter(req, file, cb) {
  try {
    getAllowedExtension(file);
    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
}

export const itemUploadMiddlewareFactory = multer({
  storage: storageEngine,
  fileFilter,
  limits: {
    files: 2,
    fileSize: 10 * 1024 * 1024,
  },
});

export function handleItemFileErrors(err, req, res, next) {
  if (err instanceof multer.MulterError || err instanceof UploadFormatError) {
    res.status(400).json({
      error: "Bad Request",
      message: err.message,
    });
    return;
  }

  next(err);
}
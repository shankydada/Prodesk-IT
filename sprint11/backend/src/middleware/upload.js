import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/avif'];

/**
 * memoryStorage keeps the file in a Buffer for the duration of the request so it
 * can be streamed straight to the CDN - nothing is written to disk by multer.
 */
const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(ApiError.badRequest(`Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_MIME.join(', ')}`));
      return;
    }
    cb(null, true);
  },
}).single('image');

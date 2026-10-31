import dotenv from 'dotenv';

dotenv.config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);

const port = toInt(process.env.PORT, 5000);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  // Everything the browser is allowed to call this API from.
  allowedOrigins: [...toList(process.env.ALLOWED_ORIGINS), ...toList(process.env.FRONTEND_URL)],
  maxUploadBytes: toInt(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
  cloudinary: {
    cloudName: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    apiKey: (process.env.CLOUDINARY_API_KEY || '').trim(),
    apiSecret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
    folder: (process.env.CLOUDINARY_FOLDER || 'sprint11/posts').trim(),
  },
};

export const isProduction = env.nodeEnv === 'production';

export const isCloudinaryConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
);

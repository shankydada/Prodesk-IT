import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from './env.js';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  console.info(`[assets] Cloudinary provider active (folder: ${env.cloudinary.folder})`);
} else {
  console.warn(
    '[assets] Cloudinary credentials missing -> using local disk storage. ' +
      'Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET for production.',
  );
}

export { cloudinary, isCloudinaryConfigured };

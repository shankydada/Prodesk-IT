import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

/** Which provider will receive the next buffer. Surfaced on /api/health. */
export const storageProvider = () => (isCloudinaryConfigured ? 'cloudinary' : 'local');

const streamToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: 'image',
        // Normalise oversized thumbnails at the CDN instead of in Node.
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

/**
 * Persists an uploaded buffer to the asset CDN and returns the URL string that
 * gets written into MongoDB. The binary never touches the database.
 */
export async function saveAsset(file) {
  if (!file) return { url: '', publicId: '', provider: 'none' };

  if (isCloudinaryConfigured) {
    try {
      const result = await streamToCloudinary(file);
      return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Local dev fallback: still a URL string in the DB, never a blob.
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const extension = path.extname(file.originalname).toLowerCase() || '.bin';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  return { url: `${env.publicBaseUrl}/uploads/${filename}`, publicId: filename, provider: 'local' };
}

/** Best-effort cleanup so deleting a post does not orphan its CDN asset. */
export async function deleteAsset(publicId, provider) {
  if (!publicId) return;
  try {
    if (provider === 'cloudinary' && isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(publicId);
      return;
    }
    if (provider === 'local') {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(publicId)));
    }
  } catch (error) {
    console.warn(`[assets] Could not delete asset ${publicId}: ${error.message}`);
  }
}

import { postRepository } from '../repositories/postRepository.js';
import { saveAsset, deleteAsset, storageProvider } from '../utils/assetStorage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const readField = (source, key) => (typeof source?.[key] === 'string' ? source[key].trim() : '');

/** Field-level validation shared by JSON and multipart submissions. */
const validatePayload = (payload) => {
  const errors = [];
  if (!payload.title) errors.push('title is required');
  else if (payload.title.length > 120) errors.push('title must be 120 characters or fewer');
  if (!payload.body) errors.push('body is required');
  else if (payload.body.length > 5000) errors.push('body must be 5000 characters or fewer');
  if (payload.author.length > 60) errors.push('author must be 60 characters or fewer');
  return errors;
};

/** GET /api/posts */
export const getPosts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number.parseInt(req.query.limit ?? '50', 10) || 50, 100);
  const posts = await postRepository.list({ limit });
  res.json({ success: true, count: posts.length, data: posts });
});

/** GET /api/posts/:id */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await postRepository.findById(req.params.id);
  if (!post) throw ApiError.notFound(`No post found with id ${req.params.id}`);
  res.json({ success: true, data: post });
});

/**
 * POST /api/posts
 * Accepts application/json OR multipart/form-data (field name: `image`).
 */
export const createPost = asyncHandler(async (req, res) => {
  // FAQ #7: multer/express.json must have parsed the body before we get here.
  const payload = {
    title: readField(req.body, 'title'),
    body: readField(req.body, 'body'),
    author: readField(req.body, 'author') || 'Anonymous',
  };

  const errors = validatePayload(payload);
  if (errors.length) throw ApiError.badRequest('Invalid post payload', errors);

  const asset = await saveAsset(req.file);
  const post = await postRepository.create({
    ...payload,
    imageUrl: asset.url,
    imagePublicId: asset.publicId,
    storageProvider: asset.provider,
  });

  res.status(201).json({ success: true, data: post });
});

/** DELETE /api/posts/:id */
export const deletePost = asyncHandler(async (req, res) => {
  const removed = await postRepository.remove(req.params.id);
  if (!removed) throw ApiError.notFound(`No post found with id ${req.params.id}`);

  await deleteAsset(removed.imagePublicId, removed.storageProvider);

  res.json({ success: true, message: 'Post deleted', data: { id: removed.id } });
});

/** GET /api/health */
export const getHealth = asyncHandler(async (_req, res) => {
  const { getDatabaseMode } = await import('../config/db.js');
  res.json({
    success: true,
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    database: getDatabaseMode(),
    assetStorage: storageProvider(),
    documentCount: await postRepository.count(),
    timestamp: new Date().toISOString(),
  });
});

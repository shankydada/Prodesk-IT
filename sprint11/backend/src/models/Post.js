import mongoose from 'mongoose';

/**
 * Sprint 11 Phase 3 constraint:
 * MongoDB stores ONLY the URL string returned by the asset CDN.
 * Base64 payloads and binary buffers are never persisted in a document.
 */
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    body: {
      type: String,
      required: [true, 'Post body is required'],
      trim: true,
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    author: {
      type: String,
      trim: true,
      default: 'Anonymous',
      maxlength: [60, 'Author cannot exceed 60 characters'],
    },
    /** Absolute URL of the uploaded thumbnail (Cloudinary secure_url, or local dev path). */
    imageUrl: { type: String, default: '', trim: true },
    /** Provider-side identifier so the asset can be destroyed alongside the document. */
    imagePublicId: { type: String, default: '', trim: true },
    storageProvider: { type: String, enum: ['cloudinary', 'local', 'none'], default: 'none' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

postSchema.index({ createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);

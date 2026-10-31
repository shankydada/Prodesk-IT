import mongoose from 'mongoose';
import { Post } from '../models/Post.js';

/**
 * Single data-access surface used by the controllers.
 * Mongo implementation is used whenever a live connection exists; otherwise an
 * in-memory store with an identical contract keeps the pipeline runnable in dev.
 */
const memory = { posts: [], sequence: 0 };

const useMongo = () => mongoose.connection.readyState === 1;

const normalize = (doc) => (doc == null ? null : {
  id: doc._id?.toString() ?? doc.id,
  title: doc.title,
  body: doc.body,
  author: doc.author,
  imageUrl: doc.imageUrl,
  imagePublicId: doc.imagePublicId,
  storageProvider: doc.storageProvider,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

export const postRepository = {
  async list({ limit = 50 } = {}) {
    if (useMongo()) {
      const docs = await Post.find().sort({ createdAt: -1 }).limit(limit).lean();
      return docs.map(normalize);
    }
    return memory.posts.slice(0, limit).map(normalize);
  },

  async findById(id) {
    if (useMongo()) {
      if (!isValidObjectId(id)) return null;
      const doc = await Post.findById(id).lean();
      return doc ? normalize(doc) : null;
    }
    return normalize(memory.posts.find((post) => String(post._id) === String(id)) ?? null);
  },

  async create(payload) {
    if (useMongo()) {
      const doc = await Post.create(payload);
      return normalize(doc.toObject());
    }
    memory.sequence += 1;
    const now = new Date().toISOString();
    const record = {
      _id: `mem-${memory.sequence}`,
      author: 'Anonymous',
      imageUrl: '',
      imagePublicId: '',
      storageProvider: 'none',
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    memory.posts.unshift(record);
    return normalize(record);
  },

  async remove(id) {
    if (useMongo()) {
      if (!isValidObjectId(id)) return null;
      const doc = await Post.findByIdAndDelete(id).lean();
      return doc ? normalize(doc) : null;
    }
    const index = memory.posts.findIndex((post) => String(post._id) === String(id));
    if (index === -1) return null;
    const [removed] = memory.posts.splice(index, 1);
    return normalize(removed);
  },

  async count() {
    if (useMongo()) return Post.countDocuments();
    return memory.posts.length;
  },
};

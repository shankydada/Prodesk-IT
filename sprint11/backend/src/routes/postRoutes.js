import { Router } from 'express';
import { createPost, deletePost, getPostById, getPosts } from '../controllers/postController.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

router.route('/').get(getPosts).post(uploadSingleImage, createPost);
router.route('/:id').get(getPostById).delete(deletePost);

export default router;

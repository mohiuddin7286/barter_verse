import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import * as communityController from '../controllers/community.controller';

const router = Router();

// Public: Sab posts dekhein
router.get('/posts', communityController.getPosts);

// Protected: Nayi post banayein (Login zaroori hai)
router.post('/posts', authRequired, communityController.createPost);

export default router;
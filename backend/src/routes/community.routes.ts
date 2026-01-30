import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import * as communityController from '../controllers/community.controller';

const router = Router();

// ============ POST ROUTES ============

// Get all posts (public)
router.get('/posts', communityController.getPosts);

// Get single post with comments (public)
router.get('/posts/:postId', communityController.getPostById);

// Create new post (auth required)
router.post('/posts', authRequired, communityController.createPost);

// Update post (auth required - own posts only)
router.put('/posts/:postId', authRequired, communityController.updatePost);

// Delete post (auth required - own posts only)
router.delete('/posts/:postId', authRequired, communityController.deletePost);

// Like a post (public)
router.post('/posts/:postId/like', communityController.likePost);

// Unlike a post (public)
router.delete('/posts/:postId/like', communityController.unlikePost);

// ============ COMMENT ROUTES ============

// Get comments for a post (public)
router.get('/posts/:postId/comments', communityController.getCommentsByPost);

// Create comment on post (auth required)
router.post('/posts/:postId/comments', authRequired, communityController.createComment);

// Update comment (auth required - own comments only)
router.put('/comments/:commentId', authRequired, communityController.updateComment);

// Delete comment (auth required - own comments only)
router.delete('/comments/:commentId', authRequired, communityController.deleteComment);

// ============ SEARCH & FILTER ROUTES ============

// Search posts
router.get('/search', communityController.searchPosts);

// Get posts by tag
router.get('/tags/:tag', communityController.getPostsByTag);

// Get author's posts
router.get('/users/:authorId/posts', communityController.getAuthorPosts);

// Get trending posts
router.get('/trending/posts', communityController.getTrendingPosts);

export default router;
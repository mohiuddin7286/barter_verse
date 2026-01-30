import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import {
  createReview,
  getReviewsForUser,
  getReviewById,
  getUserReviewsGiven,
  updateReview,
  deleteReview,
  getUserRating,
  getTopRatedUsers,
  getRecentlyReviewedUsers,
  getReviewStatistics,
  searchReviews,
  filterReviewsByRating,
} from '../controllers/reviews.controller';

const router = Router();

// ============ REVIEW CRUD ============

// Create a new review (auth required)
router.post('/', authRequired, createReview);

// Get reviews for a specific user (public)
router.get('/user/:userId', getReviewsForUser);

// Get single review (public)
router.get('/:reviewId', getReviewById);

// Get reviews given by current user (auth required)
router.get('/my-reviews/given', authRequired, getUserReviewsGiven);

// Update a review (auth required - own reviews only)
router.put('/:reviewId', authRequired, updateReview);

// Delete a review (auth required - own reviews only)
router.delete('/:reviewId', authRequired, deleteReview);

// ============ RATING & ANALYTICS ============

// Get user's rating stats (public)
router.get('/rating/:userId', getUserRating);

// Get top rated users (public)
router.get('/top-rated', getTopRatedUsers);

// Get recently reviewed users (public)
router.get('/recent/users', getRecentlyReviewedUsers);

// Get review statistics (public)
router.get('/stats/overview', getReviewStatistics);

// ============ SEARCH & FILTER ============

// Search reviews (public)
router.get('/search', searchReviews);

// Filter reviews by rating (public)
router.get('/filter/rating/:userId', filterReviewsByRating);

export default router;

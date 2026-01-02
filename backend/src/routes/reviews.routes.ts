import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import {
  createReview,
  getReviews,
  getUserReviewsGiven,
  deleteReview,
} from '../controllers/reviews.controller';

const router = Router();

// Create a new review
router.post('/', authRequired, createReview);

// Get reviews for a specific user
router.get('/user/:target_user_id', getReviews);

// Get reviews given by current user
router.get('/my-reviews/given', authRequired, getUserReviewsGiven);

// Delete a review
router.delete('/:id', authRequired, deleteReview);

export default router;

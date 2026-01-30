import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { reviewsService } from '../services/reviews.service';

// ============ REVIEW CRUD OPERATIONS ============

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const review = await reviewsService.createReview(req.user.id, req.body);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getReviewsForUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { reviews, total, averageRating } = await reviewsService.getReviewsForUser(userId, page, limit);

    res.json({
      success: true,
      data: reviews,
      stats: {
        averageRating,
        total,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewsService.getReviewById(reviewId);

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getUserReviewsGiven = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { reviews, total } = await reviewsService.getUserReviewsGiven(req.user.id, page, limit);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { reviewId } = req.params;
    const updatedReview = await reviewsService.updateReview(reviewId, req.user.id, req.body);

    res.json({ success: true, data: updatedReview });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { reviewId } = req.params;
    await reviewsService.deleteReview(reviewId, req.user.id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============ RATING & ANALYTICS ============

export const getUserRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const rating = await reviewsService.getUserRating(userId);

    res.json({ success: true, data: rating });
  } catch (error) {
    next(error);
  }
};

export const getTopRatedUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await reviewsService.getTopRatedUsers(limit);

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getRecentlyReviewedUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await reviewsService.getRecentlyReviewedUsers(limit);

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getReviewStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await reviewsService.getReviewStatistics();

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const searchReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { reviews, total } = await reviewsService.searchReviews(q, page, limit);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const filterReviewsByRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const minRating = parseInt(req.query.minRating as string) || 1;
    const maxRating = parseInt(req.query.maxRating as string) || 5;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { reviews, total } = await reviewsService.filterReviewsByRating(
      userId,
      minRating,
      maxRating,
      page,
      limit
    );

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

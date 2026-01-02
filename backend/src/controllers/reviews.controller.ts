import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../prisma/client';

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const {
      target_user_id,
      trade_id,
      listing_id,
      rating,
      comment,
    } = req.body;

    // Validate required fields
    if (!target_user_id || !rating || !comment) {
      return res.status(400).json({
        message: 'target_user_id, rating, and comment are required',
      });
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      });
    }

    // Cannot review yourself
    if (target_user_id === req.user.id) {
      return res.status(400).json({
        message: 'You cannot review yourself',
      });
    }

    // Check if target user exists
    const targetUser = await prisma.profile.findUnique({
      where: { id: target_user_id },
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        author_id: req.user.id,
        target_user_id,
        trade_id,
        listing_id,
        rating,
        comment,
      },
      include: {
        author: { select: { id: true, username: true, avatar_url: true } },
        target_user: { select: { id: true, username: true, avatar_url: true, rating: true } },
      },
    });

    // Update target user's rating (average of all reviews)
    const reviews = await prisma.review.findMany({
      where: { target_user_id },
    });

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.profile.update({
      where: { id: target_user_id },
      data: { rating: averageRating },
    });

    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { target_user_id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { target_user_id },
      include: {
        author: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ data: reviews });
  } catch (err) {
    next(err);
  }
};

export const getUserReviewsGiven = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const reviews = await prisma.review.findMany({
      where: { author_id: req.user.id },
      include: {
        target_user: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ data: reviews });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only author can delete
    if (review.author_id !== req.user.id) {
      return res.status(403).json({ message: 'You cannot delete this review' });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate target user's rating
    const reviews = await prisma.review.findMany({
      where: { target_user_id: review.target_user_id },
    });

    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;

    await prisma.profile.update({
      where: { id: review.target_user_id },
      data: { rating: averageRating },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
};

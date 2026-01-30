import { prisma } from "../prisma/client";
import { Review } from "@prisma/client";
import { AppError } from "../middleware/error.middleware";
import { z } from "zod";
import { NotificationService } from "./notifications.service";

// Validation Schemas
export const createReviewSchema = z.object({
  target_user_id: z.string().min(1, "Target user ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(5).max(1000, "Comment must be between 5 and 1000 characters"),
  trade_id: z.string().optional(),
  listing_id: z.string().optional(),
});

export const updateReviewSchema = createReviewSchema.partial().omit({ target_user_id: true });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export class ReviewsService {
  // ============ REVIEW OPERATIONS ============

  async createReview(authorId: string, data: CreateReviewInput): Promise<any> {
    const validatedData = createReviewSchema.parse(data);

    // Cannot review yourself
    if (authorId === validatedData.target_user_id) {
      throw new AppError(400, "You cannot review yourself");
    }

    // Check if target user exists
    const targetUser = await prisma.profile.findUnique({
      where: { id: validatedData.target_user_id },
    });

    if (!targetUser) {
      throw new AppError(404, "Target user not found");
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        author_id: authorId,
        target_user_id: validatedData.target_user_id,
        trade_id: validatedData.trade_id,
        listing_id: validatedData.listing_id,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
          },
        },
        target_user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
          },
        },
      },
    });

    // Recalculate target user's average rating
    await this.updateUserRating(validatedData.target_user_id);

    // Send notification to reviewed user
    try {
      const author = await prisma.profile.findUnique({
        where: { id: authorId },
        select: { username: true },
      });

      await NotificationService.createNotification({
        user_id: validatedData.target_user_id,
        type: 'review',
        title: 'New Review Received',
        message: `${author?.username} left you a ${validatedData.rating}⭐ review: "${validatedData.comment.substring(0, 50)}${validatedData.comment.length > 50 ? '...' : ''}"`,
        related_id: review.id,
        related_type: 'review',
        action_url: `/profile/${validatedData.target_user_id}`,
      });
    } catch (err) {
      console.error('Failed to send review notification:', err);
    }

    return review;
  }

  async getReviewsForUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: any[]; total: number; averageRating: number }> {
    const skip = (page - 1) * limit;

    // Get user's average rating from reviews
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { rating: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { target_user_id: userId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { target_user_id: userId } }),
    ]);

    return {
      reviews,
      total,
      averageRating: user.rating,
    };
  }

  async getReviewById(id: string): Promise<any> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
          },
        },
        target_user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!review) {
      throw new AppError(404, "Review not found");
    }

    return review;
  }

  async getUserReviewsGiven(
    authorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { author_id: authorId },
        include: {
          target_user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { author_id: authorId } }),
    ]);

    return { reviews, total };
  }

  async updateReview(
    reviewId: string,
    authorId: string,
    data: UpdateReviewInput
  ): Promise<Review> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError(404, "Review not found");
    }

    if (review.author_id !== authorId) {
      throw new AppError(403, "You can only edit your own reviews");
    }

    const validatedData = updateReviewSchema.parse(data);

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: validatedData,
    });

    // Recalculate target user's rating if rating was changed
    if (validatedData.rating !== undefined) {
      await this.updateUserRating(review.target_user_id);
    }

    return updatedReview;
  }

  async deleteReview(reviewId: string, authorId: string): Promise<void> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError(404, "Review not found");
    }

    if (review.author_id !== authorId) {
      throw new AppError(403, "You can only delete your own reviews");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate target user's rating after deletion
    await this.updateUserRating(review.target_user_id);
  }

  // ============ RATING CALCULATIONS ============

  private async updateUserRating(userId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: { target_user_id: userId },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 5.0;

    await prisma.profile.update({
      where: { id: userId },
      data: { rating: parseFloat(averageRating.toFixed(2)) },
    });
  }

  async getUserRating(userId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<number, number>;
  }> {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { rating: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const reviews = await prisma.review.findMany({
      where: { target_user_id: userId },
      select: { rating: true },
    });

    // Build rating breakdown (1 star, 2 stars, etc.)
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      breakdown[review.rating]++;
    });

    return {
      averageRating: user.rating,
      totalReviews: reviews.length,
      ratingBreakdown: breakdown,
    };
  }

  // ============ ANALYTICS & FILTERING ============

  async getTopRatedUsers(limit: number = 10): Promise<any[]> {
    return await prisma.profile.findMany({
      where: {
        reviews_received: {
          some: {}, // Has at least one review
        },
      },
      select: {
        id: true,
        username: true,
        avatar_url: true,
        rating: true,
        display_name: true,
      },
      orderBy: { rating: "desc" },
      take: limit,
    });
  }

  async getRecentlyReviewedUsers(limit: number = 10): Promise<any[]> {
    const reviews = await prisma.review.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        target_user_id: true,
        created_at: true,
      },
      distinct: ["target_user_id"],
    });

    const userIds = reviews.map((r) => r.target_user_id);

    return await prisma.profile.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        avatar_url: true,
        rating: true,
        display_name: true,
      },
    });
  }

  async getHighestRatedByCategory(
    category: string,
    limit: number = 5
  ): Promise<any[]> {
    // Reviews on listings of a specific category
    const reviews = await prisma.review.findMany({
      where: {
        listing_id: {
          not: null,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
            display_name: true,
          },
        },
      },
      orderBy: { rating: "desc" },
      take: limit,
    });

    return reviews.map((r) => ({
      ...r.author,
      reviewRating: r.rating,
    }));
  }

  async getReviewStatistics(): Promise<{
    totalReviews: number;
    averageRating: number;
    reviewsThisMonth: number;
    mostReviewedUser: any;
  }> {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [totalReviews, allReviews, recentReviews, mostReviewed] = await Promise.all([
      prisma.review.count(),
      prisma.review.findMany({ select: { rating: true } }),
      prisma.review.findMany({
        where: { created_at: { gte: monthAgo } },
      }),
      prisma.review.groupBy({
        by: ["target_user_id"],
        _count: { target_user_id: true },
        orderBy: { _count: { target_user_id: "desc" } },
        take: 1,
      }),
    ]);

    const averageRating =
      allReviews.length > 0
        ? parseFloat(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2)
          )
        : 0;

    let mostReviewedUserData = null;
    if (mostReviewed.length > 0) {
      mostReviewedUserData = await prisma.profile.findUnique({
        where: { id: mostReviewed[0].target_user_id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          rating: true,
        },
      });
    }

    return {
      totalReviews,
      averageRating,
      reviewsThisMonth: recentReviews.length,
      mostReviewedUser: mostReviewedUserData,
    };
  }

  async searchReviews(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          OR: [
            { comment: { contains: query, mode: "insensitive" } },
            { author: { username: { contains: query, mode: "insensitive" } } },
            { target_user: { username: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
            },
          },
          target_user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          OR: [
            { comment: { contains: query, mode: "insensitive" } },
            { author: { username: { contains: query, mode: "insensitive" } } },
            { target_user: { username: { contains: query, mode: "insensitive" } } },
          ],
        },
      }),
    ]);

    return { reviews, total };
  }

  async filterReviewsByRating(
    userId: string,
    minRating: number,
    maxRating: number = 5,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          target_user_id: userId,
          rating: {
            gte: minRating,
            lte: maxRating,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          target_user_id: userId,
          rating: {
            gte: minRating,
            lte: maxRating,
          },
        },
      }),
    ]);

    return { reviews, total };
  }
}

export const reviewsService = new ReviewsService();

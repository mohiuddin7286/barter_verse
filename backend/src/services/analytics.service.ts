import { ListingStatus, SessionStatus, TradeStatus } from '@prisma/client';
import { prisma } from '../prisma/client';

/**
 * Analytics Service
 * Provides Prisma-backed platform analytics for the dashboard routes.
 */
export class AnalyticsService {
  private getCutoff(days: number) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  private average(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private round(value: number, digits = 1) {
    const multiplier = 10 ** digits;
    return Math.round(value * multiplier) / multiplier;
  }

  private buildDailySeries<T>(items: T[], getDate: (item: T) => Date | null | undefined, days: number) {
    const cutoff = this.getCutoff(days);
    const buckets = new Map<string, number>();

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      buckets.set(date.toISOString().slice(0, 10), 0);
    }

    for (const item of items) {
      const date = getDate(item);
      if (!date || date < cutoff) {
        continue;
      }

      const bucketDate = new Date(date);
      bucketDate.setHours(0, 0, 0, 0);
      const key = bucketDate.toISOString().slice(0, 10);

      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
  }

  async getUserAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);

    const [total, newUsers, reviewedProfiles, recentUsers, ratings, growthUsers, activeProfiles] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { created_at: { gte: cutoff } } }),
      prisma.profile.count({ where: { reviews_received: { some: {} } } }),
      prisma.profile.findMany({ where: { created_at: { gte: cutoff } }, select: { created_at: true } }),
      prisma.profile.findMany({ select: { rating: true } }),
      prisma.profile.findMany({ where: { created_at: { gte: cutoff } }, select: { created_at: true } }),
      prisma.profile.findMany({
        where: {
          OR: [
            { listings: { some: { created_at: { gte: cutoff } } } },
            { trades_initiated: { some: { created_at: { gte: cutoff } } } },
            { trades_received: { some: { created_at: { gte: cutoff } } } },
            { posts: { some: { createdAt: { gte: cutoff } } } },
            { comments: { some: { createdAt: { gte: cutoff } } } },
            { reviews_authored: { some: { created_at: { gte: cutoff } } } },
            { reviews_received: { some: { created_at: { gte: cutoff } } } },
            { sessions_as_provider: { some: { created_at: { gte: cutoff } } } },
            { sessions_as_participant: { some: { created_at: { gte: cutoff } } } },
          ],
        },
        select: { id: true },
      }),
    ]);

    return {
      total,
      new: newUsers,
      active: activeProfiles.length,
      withReviews: reviewedProfiles,
      averageRating: this.round(this.average(ratings.map((profile) => profile.rating))),
      growthTrend: this.buildDailySeries(growthUsers.length ? growthUsers : recentUsers, (user) => user.created_at, days),
    };
  }

  async getActiveUsersAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);

    const [profiles, trades, listings, posts, comments, reviews, sessions] = await Promise.all([
      prisma.profile.findMany({
        where: { created_at: { gte: cutoff } },
        select: { id: true, username: true, display_name: true, avatar_url: true, created_at: true },
      }),
      prisma.trade.findMany({
        where: { created_at: { gte: cutoff } },
        select: { initiator_id: true, responder_id: true, created_at: true },
      }),
      prisma.listing.findMany({
        where: { created_at: { gte: cutoff } },
        select: { owner_id: true, created_at: true },
      }),
      prisma.post.findMany({
        where: { createdAt: { gte: cutoff } },
        select: { authorId: true, createdAt: true },
      }),
      prisma.comment.findMany({
        where: { createdAt: { gte: cutoff } },
        select: { authorId: true, createdAt: true },
      }),
      prisma.review.findMany({
        where: { created_at: { gte: cutoff } },
        select: { author_id: true, target_user_id: true, created_at: true },
      }),
      prisma.session.findMany({
        where: { created_at: { gte: cutoff } },
        select: { provider_id: true, participant_id: true, created_at: true },
      }),
    ]);

    const activityScores = new Map<string, { score: number; lastActivity: Date; username?: string; display_name?: string | null; avatar_url?: string | null }>();

    const bump = (
      userId: string,
      score: number,
      timestamp: Date,
      profile?: { username?: string; display_name?: string | null; avatar_url?: string | null }
    ) => {
      const current = activityScores.get(userId);
      const nextScore = (current?.score ?? 0) + score;
      const lastActivity = !current || timestamp > current.lastActivity ? timestamp : current.lastActivity;

      activityScores.set(userId, {
        score: nextScore,
        lastActivity,
        username: profile?.username ?? current?.username,
        display_name: profile?.display_name ?? current?.display_name,
        avatar_url: profile?.avatar_url ?? current?.avatar_url,
      });
    };

    for (const profile of profiles) {
      bump(profile.id, 1, profile.created_at, profile);
    }

    for (const trade of trades) {
      bump(trade.initiator_id, 2, trade.created_at);
      bump(trade.responder_id, 2, trade.created_at);
    }

    for (const listing of listings) {
      bump(listing.owner_id, 2, listing.created_at);
    }

    for (const post of posts) {
      bump(post.authorId, 3, post.createdAt);
    }

    for (const comment of comments) {
      bump(comment.authorId, 2, comment.createdAt);
    }

    for (const review of reviews) {
      bump(review.author_id, 2, review.created_at);
      bump(review.target_user_id, 1, review.created_at);
    }

    for (const session of sessions) {
      bump(session.provider_id, 2, session.created_at);
      bump(session.participant_id, 2, session.created_at);
    }

    return Array.from(activityScores.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((left, right) => right.score - left.score || right.lastActivity.getTime() - left.lastActivity.getTime());
  }

  async getUserGrowthTrend(days = 30) {
    const cutoff = this.getCutoff(days);
    const users = await prisma.profile.findMany({
      where: { created_at: { gte: cutoff } },
      select: { created_at: true },
    });

    return this.buildDailySeries(users, (user) => user.created_at, days);
  }

  async getAverageUserRating() {
    const profiles = await prisma.profile.findMany({ select: { rating: true } });
    return this.round(this.average(profiles.map((profile) => profile.rating)));
  }

  async getTradeAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);

    const [total, completed, pending, trades, statusRows] = await Promise.all([
      prisma.trade.count({ where: { created_at: { gte: cutoff } } }),
      prisma.trade.count({ where: { created_at: { gte: cutoff }, status: TradeStatus.COMPLETED } }),
      prisma.trade.count({ where: { created_at: { gte: cutoff }, status: TradeStatus.PENDING } }),
      prisma.trade.findMany({
        where: { created_at: { gte: cutoff } },
        select: { created_at: true, coin_amount: true, status: true },
      }),
      prisma.trade.groupBy({
        by: ['status'],
        where: { created_at: { gte: cutoff } },
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      completed,
      pending,
      averageValue: this.round(this.average(trades.map((trade) => trade.coin_amount))),
      growthTrend: this.buildDailySeries(trades, (trade) => trade.created_at, days),
      statusBreakdown: statusRows.reduce<Record<string, number>>((accumulator, row) => {
        accumulator[row.status] = row._count._all;
        return accumulator;
      }, {}),
    };
  }

  async getCommunityAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);

    const [posts, comments] = await Promise.all([
      prisma.post.findMany({ where: { createdAt: { gte: cutoff } }, select: { id: true, likes: true } }),
      prisma.comment.findMany({ where: { createdAt: { gte: cutoff } }, select: { id: true } }),
    ]);

    const totalPosts = posts.length;
    const totalComments = comments.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

    return {
      totalPosts,
      totalComments,
      engagementRate: totalPosts === 0 ? 0 : this.round(((totalComments + totalLikes) / totalPosts) * 100),
    };
  }

  async getListingAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);

    const [listings, activeCount] = await Promise.all([
      prisma.listing.findMany({
        where: { created_at: { gte: cutoff } },
        select: { category: true, status: true },
      }),
      prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
    ]);

    const trendingCategories = new Map<string, number>();

    for (const listing of listings) {
      trendingCategories.set(listing.category, (trendingCategories.get(listing.category) ?? 0) + 1);
    }

    return {
      total: listings.length,
      active: activeCount,
      trending: Array.from(trendingCategories.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((left, right) => right.count - left.count),
    };
  }

  async getDashboardSummary(days = 30) {
    const [users, trades, listings, community, sessions, reviews] = await Promise.all([
      this.getUserAnalytics(days),
      this.getTradeAnalytics(days),
      this.getListingAnalytics(days),
      this.getCommunityAnalytics(days),
      this.getSessionAnalytics(days),
      this.getReviewAnalytics(days),
    ]);

    return {
      period: `Last ${days} days`,
      generated_at: new Date().toISOString(),
      summary: {
        users: { total: users.total, new: users.new, active: users.active },
        trades: { total: trades.total, completed: trades.completed, pending: trades.pending },
        listings: { total: listings.total, active: listings.active },
        community: { posts: community.totalPosts, comments: community.totalComments, engagementRate: community.engagementRate },
        sessions: { total: sessions.total, completed: sessions.completed, averageRating: sessions.averageRating },
        reviews: { total: reviews.total, averageRating: reviews.averageRating },
      },
    };
  }

  async exportAnalyticsAsCSV(days = 30): Promise<string> {
    const summary = await this.getDashboardSummary(days);
    let csv = 'BarterVerse Analytics Report\n';
    csv += `Generated,${summary.generated_at}\n`;
    csv += `Period,${summary.period}\n\n`;
    csv += 'Category,Metric,Value\n';
    csv += `Users,Total,${summary.summary.users.total}\n`;
    csv += `Users,New,${summary.summary.users.new}\n`;
    csv += `Users,Active,${summary.summary.users.active}\n`;
    csv += `Trades,Total,${summary.summary.trades.total}\n`;
    csv += `Trades,Completed,${summary.summary.trades.completed}\n`;
    csv += `Trades,Pending,${summary.summary.trades.pending}\n`;
    csv += `Listings,Total,${summary.summary.listings.total}\n`;
    csv += `Listings,Active,${summary.summary.listings.active}\n`;
    csv += `Community,Posts,${summary.summary.community.posts}\n`;
    csv += `Community,Comments,${summary.summary.community.comments}\n`;
    csv += `Community,Engagement Rate,${summary.summary.community.engagementRate}\n`;
    csv += `Sessions,Total,${summary.summary.sessions.total}\n`;
    csv += `Sessions,Completed,${summary.summary.sessions.completed}\n`;
    csv += `Sessions,Average Rating,${summary.summary.sessions.averageRating}\n`;
    csv += `Reviews,Total,${summary.summary.reviews.total}\n`;
    csv += `Reviews,Average Rating,${summary.summary.reviews.averageRating}\n`;
    return csv;
  }

  async getTopRatedUsers(limit = 10) {
    return prisma.profile.findMany({
      take: limit,
      orderBy: [{ rating: 'desc' }, { updated_at: 'desc' }],
      select: {
        id: true,
        username: true,
        display_name: true,
        avatar_url: true,
        rating: true,
        level: true,
        xp_points: true,
        _count: {
          select: {
            reviews_received: true,
          },
        },
      },
    });
  }

  async getMostActiveUsers(limit = 10, days = 30) {
    const users = await this.getActiveUsersAnalytics(days);

    return users.slice(0, limit).map((user) => ({
      id: user.userId,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      score: user.score,
      lastActivity: user.lastActivity,
    }));
  }

  async getTopTraders(limit = 10, days = 30) {
    const cutoff = this.getCutoff(days);
    const trades = await prisma.trade.findMany({
      where: { created_at: { gte: cutoff } },
      select: {
        initiator_id: true,
        responder_id: true,
        status: true,
        coin_amount: true,
      },
    });

    const leaderboard = new Map<string, { trades: number; completed: number; value: number }>();

    const bump = (userId: string, trade: (typeof trades)[number]) => {
      const current = leaderboard.get(userId) ?? { trades: 0, completed: 0, value: 0 };
      current.trades += 1;
      current.value += trade.coin_amount;
      if (trade.status === TradeStatus.COMPLETED) {
        current.completed += 1;
      }
      leaderboard.set(userId, current);
    };

    for (const trade of trades) {
      bump(trade.initiator_id, trade);
      bump(trade.responder_id, trade);
    }

    const userIds = Array.from(leaderboard.keys());
    const users = await prisma.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, display_name: true, avatar_url: true },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    return Array.from(leaderboard.entries())
      .map(([userId, data]) => ({
        id: userId,
        ...(userMap.get(userId) ?? {}),
        ...data,
      }))
      .sort((left, right) => right.completed - left.completed || right.trades - left.trades || right.value - left.value)
      .slice(0, limit);
  }

  async getSessionAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);
    const sessions = await prisma.session.findMany({
      where: { created_at: { gte: cutoff } },
      select: { status: true, rating: true },
    });

    const completed = sessions.filter((session) => session.status === SessionStatus.COMPLETED);

    return {
      total: sessions.length,
      completed: completed.length,
      averageRating: this.round(this.average(completed.map((session) => session.rating ?? 0).filter((rating) => rating > 0))),
    };
  }

  async getReviewAnalytics(days = 30) {
    const cutoff = this.getCutoff(days);
    const reviews = await prisma.review.findMany({
      where: { created_at: { gte: cutoff } },
      select: { rating: true },
    });

    return {
      total: reviews.length,
      averageRating: this.round(this.average(reviews.map((review) => review.rating))),
    };
  }

  async getListingsAnalytics(days = 30) {
    const analytics = await this.getListingAnalytics(days);

    return {
      total: analytics.total,
      active: analytics.active,
    };
  }

  async getSystemHealthAnalytics() {
    const [dbStatus, activeUsers, recentErrors] = await Promise.all([
      prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`,
      prisma.profile.count({ where: { updated_at: { gte: this.getCutoff(1) } } }),
      prisma.auditLog.count({ where: { status: 'failure', createdAt: { gte: this.getCutoff(1) } } }),
    ]);

    return {
      status: dbStatus.length > 0 ? 'healthy' : 'degraded',
      uptime: Math.floor(process.uptime()),
      errorRate: activeUsers === 0 ? 0 : this.round((recentErrors / activeUsers) * 100),
    };
  }
}

export const analyticsService = new AnalyticsService();

import { prisma } from "../prisma/client";
import { Post, Comment } from "@prisma/client";
import { AppError } from "../middleware/error.middleware";
import { z } from "zod";
import { NotificationService } from "./notifications.service";

// Validation Schemas
export const createPostSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10).max(5000),
  tag: z.string().optional().default("General"),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export class CommunityService {
  // ============ POST OPERATIONS ============

  async createPost(
    authorId: string,
    data: CreatePostInput
  ): Promise<Post & { author: any; _count: any }> {
    const validatedData = createPostSchema.parse(data);

    return await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        tag: validatedData.tag,
        authorId,
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
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async getPosts(
    page: number = 1,
    limit: number = 10,
    tag?: string
  ): Promise<{ posts: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tag && tag !== "all") {
      where.tag = tag;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return { posts, total };
  }

  async getPostById(id: string): Promise<any> {
    const post = await prisma.post.findUnique({
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
        comments: {
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
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    return post;
  }

  async updatePost(
    postId: string,
    authorId: string,
    data: UpdatePostInput
  ): Promise<Post> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.authorId !== authorId) {
      throw new AppError(403, "You can only edit your own posts");
    }

    const validatedData = updatePostSchema.parse(data);

    return await prisma.post.update({
      where: { id: postId },
      data: validatedData,
    });
  }

  async deletePost(postId: string, authorId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.authorId !== authorId) {
      throw new AppError(403, "You can only delete your own posts");
    }

    // Comments will cascade delete due to schema onDelete: Cascade
    await prisma.post.delete({
      where: { id: postId },
    });
  }

  async likePost(postId: string): Promise<Post> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: post.likes + 1,
      },
    });

    return updatedPost;
  }

  async unlikePost(postId: string): Promise<Post> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: Math.max(0, post.likes - 1),
      },
    });

    return updatedPost;
  }

  // ============ COMMENT OPERATIONS ============

  async createComment(
    postId: string,
    authorId: string,
    data: CreateCommentInput
  ): Promise<Comment & { author: any }> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const validatedData = createCommentSchema.parse(data);

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId,
        authorId,
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
    });

    // Send notification to post author if not the commenter
    if (post.authorId !== authorId) {
      try {
        const commenter = await prisma.profile.findUnique({
          where: { id: authorId },
          select: { username: true },
        });

        await NotificationService.createNotification({
          user_id: post.authorId,
          type: 'comment',
          title: 'New Comment on Your Post',
          message: `${commenter?.username} commented on "${post.title}": "${validatedData.content.substring(0, 50)}${validatedData.content.length > 50 ? '...' : ''}"`,
          related_id: comment.id,
          related_type: 'comment',
          action_url: `/community/${postId}`,
        });
      } catch (err) {
        console.error('Failed to send comment notification:', err);
      }
    }

    return comment;
  }

  async getCommentsByPost(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ comments: any[]; total: number }> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { postId } }),
    ]);

    return { comments, total };
  }

  async getCommentById(commentId: string): Promise<any> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    authorId: string,
    data: CreateCommentInput
  ): Promise<Comment> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.authorId !== authorId) {
      throw new AppError(403, "You can only edit your own comments");
    }

    const validatedData = createCommentSchema.parse(data);

    return await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: validatedData.content,
      },
    });
  }

  async deleteComment(commentId: string, authorId: string): Promise<void> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.authorId !== authorId) {
      throw new AppError(403, "You can only delete your own comments");
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // ============ SEARCH & FILTER ============

  async searchPosts(query: string, limit: number = 10): Promise<any[]> {
    return await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { tag: { contains: query, mode: "insensitive" } },
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
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getPostsByTag(
    tag: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { tag },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { tag } }),
    ]);

    return { posts, total };
  }

  async getAuthorPosts(
    authorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { authorId } }),
    ]);

    return { posts, total };
  }

  async getTrendingPosts(limit: number = 5): Promise<any[]> {
    return await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { likes: "desc" },
      take: limit,
    });
  }
}

export const communityService = new CommunityService();

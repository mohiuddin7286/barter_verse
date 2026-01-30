import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { communityService } from '../services/community.service';
import { AppError } from '../middleware/error.middleware';

// ============ POST CONTROLLERS ============

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { title, content, tag } = req.body;

    const post = await communityService.createPost(req.user.id, {
      title,
      content,
      tag,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tag = (req.query.tag as string) || undefined;

    const { posts, total } = await communityService.getPosts(page, limit, tag);

    res.json({
      success: true,
      data: posts,
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

export const getPostById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const post = await communityService.getPostById(postId);

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { postId } = req.params;
    const { title, content, tag } = req.body;

    const updatedPost = await communityService.updatePost(postId, req.user.id, {
      title,
      content,
      tag,
    });

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { postId } = req.params;
    await communityService.deletePost(postId, req.user.id);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const post = await communityService.likePost(postId);

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const post = await communityService.unlikePost(postId);

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// ============ COMMENT CONTROLLERS ============

export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { postId } = req.params;
    const { content } = req.body;

    const comment = await communityService.createComment(
      postId,
      req.user.id,
      { content }
    );

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { comments, total } = await communityService.getCommentsByPost(
      postId,
      page,
      limit
    );

    res.json({
      success: true,
      data: comments,
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

export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await communityService.updateComment(
      commentId,
      req.user.id,
      { content }
    );

    res.json({ success: true, data: updatedComment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { commentId } = req.params;
    await communityService.deleteComment(commentId, req.user.id);

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============ SEARCH & FILTER CONTROLLERS ============

export const searchPosts = async (
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

    const posts = await communityService.searchPosts(q, 10);

    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const getPostsByTag = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { posts, total } = await communityService.getPostsByTag(
      tag,
      page,
      limit
    );

    res.json({
      success: true,
      data: posts,
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

export const getAuthorPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { posts, total } = await communityService.getAuthorPosts(
      authorId,
      page,
      limit
    );

    res.json({
      success: true,
      data: posts,
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

export const getTrendingPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await communityService.getTrendingPosts(5);

    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};
import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, tag } = req.body;
    
    // Validation: Check if title or content is empty
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and Content are required" 
      });
    }

    // @ts-ignore
    const userId = req.user.id;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        tag: tag || "General",
        authorId: userId
      },
      include: {
        author: { select: { id: true, username: true, avatar_url: true } }
      }
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, avatar_url: true } },
        // Future proofing: Agar comments count dikhana ho
        _count: {
          select: { comments: true } 
        }
      }
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};
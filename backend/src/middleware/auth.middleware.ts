import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import { authService } from "@/services/auth.service";
import { prisma } from "@/prisma/client";

// Extend Express Request to include userId and userRole
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    
    // Verify token and extract userId
    req.userId = authService.verifyToken(token);

    if (!req.userId) {
      throw new AppError(401, "User ID not found in token");
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Authentication failed");
  }
};

export const adminMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    
    // Verify token and extract userId
    req.userId = authService.verifyToken(token);

    if (!req.userId) {
      throw new AppError(401, "User ID not found in token");
    }

    // Check if user is admin
    const user = await prisma.profile.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.role !== "admin") {
      throw new AppError(403, "Admin access required");
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/types/index";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[Error]:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    } as ApiResponse<null>);
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      success: false,
      error: "Database operation failed",
    } as ApiResponse<null>);
  }

  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      success: false,
      error: "Invalid data provided",
    } as ApiResponse<null>);
  }

  // Default error
  res.status(500).json({
    success: false,
    error: "Internal server error",
  } as ApiResponse<null>);
};

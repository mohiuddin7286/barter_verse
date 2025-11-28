import { Request, Response, NextFunction } from "express";
import { authService } from "@/services/auth.service";
import { AppError } from "@/middleware/error.middleware";

export const authController = {
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password) {
        throw new AppError(400, "Email and password are required");
      }

      const result = await authService.signup(email, password, username || email.split("@")[0]);
      
      res.status(201).json({
        success: true,
        data: result,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  signin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, "Email and password are required");
      }

      const result = await authService.signin(email, password);
      
      res.status(200).json({
        success: true,
        data: result,
        message: "Signed in successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

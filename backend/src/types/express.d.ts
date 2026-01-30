import { Profile } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: Profile;
    }
  }
}

export type AuthRequest = Request & {
  user?: Profile;
};

export {};

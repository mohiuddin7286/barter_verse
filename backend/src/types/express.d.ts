import { Profile } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: Profile;
    }
  }
}

export {};

import { Request } from 'express';
import { Profile } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: Profile;
}

export interface JwtPayload {
  id: string;
  role: string;
}

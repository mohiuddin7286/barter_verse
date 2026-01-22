import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';

const buildUserPayload = (user: any) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  avatar_url: user.avatar_url,
  bio: user.bio,
  coins: user.coins,
  rating: user.rating,
  role: user.role,
});

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // If frontend did not provide a username, derive one from the email
    let finalUsername = username;
    if (!finalUsername) {
      const base = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'user';
      finalUsername = base;
      
      // Ensure uniqueness by appending timestamp if needed
      let i = 0;
      while (i < 100) { // Limit to 100 attempts
        const existing = await prisma.profile.findUnique({ where: { username: finalUsername } });
        if (!existing) break; // Username is free, use it
        i += 1;
        finalUsername = `${base}${i}`;
      }
      
      // If still colliding after 100 attempts, add random suffix
      if (i >= 100) {
        finalUsername = `${base}_${Date.now()}`;
      }
    }

    const existingEmail = await prisma.profile.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.profile.create({
      data: {
        email,
        username: finalUsername,
        password: hashed,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.status(201).json({ data: { token, user: buildUserPayload(user) } });
  } catch (err: any) {
    console.error('signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Support both `{ emailOrUsername, password }` and `{ email, password }` payloads
    const { emailOrUsername, email, username, password } = req.body;
    const identifier = emailOrUsername ?? email ?? username;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

    const user = await prisma.profile.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.json({ data: { token, user: buildUserPayload(user) } });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string; role: string };

    const user = await prisma.profile.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: { user: buildUserPayload(user) } });
  } catch (err) {
    console.error('me error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    console.log('updateProfile called');
    console.log('req.userId:', (req as any).userId);
    console.log('req.user:', (req as any).user);
    console.log('req.headers.authorization:', req.headers.authorization);
    
    const userId = (req as any).userId || (req as any).user?.id;
    
    if (!userId) {
      console.error('No userId found in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { display_name, bio, avatar_url } = req.body;

    const updateData: any = {};
    if (display_name) {
      updateData.username = display_name;
      updateData.display_name = display_name;
    }
    if (bio !== undefined) {
      updateData.bio = bio;
    }
    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    console.log('Updating user', userId, 'with data:', Object.keys(updateData));

    const user = await prisma.profile.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({ 
      success: true,
      data: { user: buildUserPayload(user) }
    });
  } catch (err: any) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

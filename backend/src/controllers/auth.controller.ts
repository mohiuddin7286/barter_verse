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

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingEmail = await prisma.profile.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const existingUsername = await prisma.profile.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.profile.create({
      data: {
        email,
        username,
        password: hashed,
        // coins default = 100, rating=5.0, role="user"
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (err: any) {
    console.error('signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = await prisma.profile.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: buildUserPayload(user),
    });
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

    res.json({ user: buildUserPayload(user) });
  } catch (err) {
    console.error('me error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

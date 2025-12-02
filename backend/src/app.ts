import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import tradesRoutes from './routes/trades.routes';
import coinsRoutes from './routes/coins.routes';
import adminRoutes from './routes/admin.routes';

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

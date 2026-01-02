import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import tradesRoutes from './routes/trades.routes';
import coinsRoutes from './routes/coins.routes';
import adminRoutes from './routes/admin.routes';
import listingsRoutes from './routes/listings.routes';
import privacyRoutes from './routes/privacy.routes';
import locationRoutes from './routes/location.routes';
import sessionsRoutes from './routes/sessions.routes';
import chatRoutes from './routes/chat.routes';
import reviewsRoutes from './routes/reviews.routes';

export const app = express();

// Security middleware
app.use(helmet());

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081', 'http://127.0.0.1:8082'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewsRoutes);

app.use(errorHandler);

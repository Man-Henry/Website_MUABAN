/**
 * @fileoverview Express app — khởi tạo middleware, routes, error handler.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './shared/middlewares/errorHandler.middleware.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import listingsRoutes from './modules/listings/listings.routes.js';
import conversationsRoutes from './modules/conversations/conversations.routes.js';
import { listingReviewsRouter, userReviewsRouter } from './modules/reviews/reviews.routes.js';

const app = express();

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/conversations', conversationsRoutes);

// Nested routes: reviews under listings and users
app.use('/api/listings/:listingId/reviews', listingReviewsRouter);
app.use('/api/users/:userId', userReviewsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Error Handler (phải đặt cuối cùng)
// ---------------------------------------------------------------------------

app.use(errorHandler);

export default app;

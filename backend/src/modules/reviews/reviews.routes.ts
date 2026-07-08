/**
 * @fileoverview Reviews routes.
 * Reviews are nested under listings (/api/listings/:listingId/reviews)
 * and users (/api/users/:userId/reviews, /api/users/:userId/rating).
 * These routes are registered in the parent routers.
 */

import { Router } from 'express';
import { reviewsController } from './reviews.controller.js';
import { requireAuth } from '../../shared/middlewares/auth.middleware.js';
import { validateBody } from '../../shared/middlewares/validate.middleware.js';
import { createReviewSchema } from './reviews.validation.js';

/** Routes gắn vào /api/listings/:listingId/reviews */
export const listingReviewsRouter = Router({ mergeParams: true });
listingReviewsRouter.get('/', reviewsController.getListingReviews);
listingReviewsRouter.post('/', requireAuth, validateBody(createReviewSchema), reviewsController.createReview);

/** Routes gắn vào /api/users/:userId/reviews & /api/users/:userId/rating */
export const userReviewsRouter = Router({ mergeParams: true });
userReviewsRouter.get('/reviews', reviewsController.getSellerReviews);
userReviewsRouter.get('/rating', reviewsController.getSellerRating);

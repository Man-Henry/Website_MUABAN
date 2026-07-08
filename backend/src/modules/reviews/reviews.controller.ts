/**
 * @fileoverview Reviews controller.
 */

import type { Request, Response } from 'express';
import { reviewsService } from './reviews.service.js';

export const reviewsController = {
  async getListingReviews(req: Request, res: Response) {
    const reviews = await reviewsService.getListingReviews(req.params.listingId as string);
    res.json(reviews);
  },

  async getSellerReviews(req: Request, res: Response) {
    const reviews = await reviewsService.getSellerReviews(req.params.userId as string);
    res.json(reviews);
  },

  async getSellerRating(req: Request, res: Response) {
    const rating = await reviewsService.getSellerRating(req.params.userId as string);
    res.json(rating);
  },

  async createReview(req: Request, res: Response) {
    const review = await reviewsService.createReview(
      req.user!.userId,
      req.params.listingId as string,
      req.body,
    );
    res.status(201).json(review);
  },
};

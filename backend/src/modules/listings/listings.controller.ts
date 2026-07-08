/**
 * @fileoverview Listings controller.
 */

import type { Request, Response } from 'express';
import { listingsService } from './listings.service.js';

export const listingsController = {
  async getListings(req: Request, res: Response) {
    const listings = await listingsService.getListings(req.query);
    res.json(listings);
  },

  async getListing(req: Request, res: Response) {
    const listing = await listingsService.getListing(req.params.id as string);
    res.json(listing);
  },

  async createListing(req: Request, res: Response) {
    const files = (req.files as Express.Multer.File[]) || [];
    const listing = await listingsService.createListing(req.user!.userId, req.body, files);
    res.status(201).json(listing);
  },

  async updateListing(req: Request, res: Response) {
    const files = (req.files as Express.Multer.File[]) || [];
    const listing = await listingsService.updateListing(req.params.id as string, req.user!.userId, req.body, files);
    res.json(listing);
  },

  async updateStatus(req: Request, res: Response) {
    const listing = await listingsService.updateStatus(req.params.id as string, req.user!.userId, req.body.status);
    res.json(listing);
  },

  async deleteListing(req: Request, res: Response) {
    await listingsService.deleteListing(req.params.id as string, req.user!.userId);
    res.status(204).send();
  },
};

/**
 * @fileoverview Listings routes.
 */

import { Router } from 'express';
import { listingsController } from './listings.controller.js';
import { requireAuth } from '../../shared/middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../shared/middlewares/validate.middleware.js';
import { uploadListingImages } from '../../shared/middlewares/upload.middleware.js';
import { updateStatusSchema, listingQuerySchema } from './listings.validation.js';

const router = Router();

// Public
router.get('/', validateQuery(listingQuerySchema), listingsController.getListings);
router.get('/:id', listingsController.getListing);

// Protected
router.post('/', requireAuth, uploadListingImages, listingsController.createListing);
router.put('/:id', requireAuth, uploadListingImages, listingsController.updateListing);
router.patch('/:id/status', requireAuth, validateBody(updateStatusSchema), listingsController.updateStatus);
router.delete('/:id', requireAuth, listingsController.deleteListing);

export default router;

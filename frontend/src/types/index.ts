/**
 * @fileoverview Barrel export cho tất cả type definitions.
 * Re-export từ các file types riêng lẻ để import thuận tiện.
 */

// Auth types — source of truth từ auth.types.ts
export type { User, LoginPayload, RegisterPayload, AuthResponse, AuthState } from './auth.types';

// Listing types
export type { ListingImage, ListingCategory, ListingCondition, ListingStatus, CreateListingPayload, UpdateListingStatusPayload, UpdateListingPayload, Listing } from './listing.types';

// Message types
export type { Message, Conversation, SendMessagePayload, StartConversationPayload, MessageState } from './message.types';

// Review types
export type { Review, SellerRating, CreateReviewPayload } from './review.types';

// ===== Listing Form Data (dùng cho PostListing page) =====
export interface ListingFormData {
  images: File[];
  previews: { id: string; url: string }[];
  name: string;
  category: import('./listing.types').ListingCategory | '';
  description: string;
  price: string;
  negotiable: boolean;
  condition: import('./listing.types').ListingCondition | '';
}

// ===== Edit Listing Form Data (dùng cho EditListing page) =====
export interface EditListingFormData extends ListingFormData {
  /** Ảnh hiện tại từ server (chưa bị xoá) */
  existingImages: import('./listing.types').ListingImage[];
  /** Danh sách ID ảnh đã đánh dấu xoá */
  removedImageIds: string[];
}


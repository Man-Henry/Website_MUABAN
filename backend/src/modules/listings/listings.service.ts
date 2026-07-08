/**
 * @fileoverview Listings service — CRUD + search/filter/sort/pagination.
 */

import { type Prisma, type ListingCategory as PrismaListingCategory } from '@prisma/client';
import prisma from '../../config/db.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/utils/cloudinary.js';

/** Map condition string → Prisma enum */
const conditionMap: Record<string, 'new_item' | 'like_new' | 'good' | 'fair'> = {
  'new': 'new_item',
  'like-new': 'like_new',
  'good': 'good',
  'fair': 'fair',
};

/** Map Prisma enum → frontend condition string */
const conditionReverseMap: Record<string, string> = {
  'new_item': 'new',
  'like_new': 'like-new',
  'good': 'good',
  'fair': 'fair',
};

/** Include relations for listing queries */
const listingInclude = {
  images: { select: { id: true, url: true } },
  seller: { select: { id: true, email: true, displayName: true, avatar: true } },
} as const;

/** Format listing for frontend response */
const formatListing = (listing: Record<string, unknown> & { condition: string }) => ({
  ...listing,
  condition: conditionReverseMap[listing.condition] || listing.condition,
});

export const listingsService = {
  /**
   * Lấy danh sách tin đăng với search/filter/sort/pagination.
   */
  async getListings(params: {
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.ListingWhereInput = { status: 'active' };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.category) {
      where.category = params.category as PrismaListingCategory;
    }
    if (params.condition) {
      const mapped = conditionMap[params.condition];
      if (mapped) where.condition = mapped;
    }
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const priceFilter: Prisma.FloatFilter = {};
      if (params.minPrice !== undefined) priceFilter.gte = params.minPrice;
      if (params.maxPrice !== undefined) priceFilter.lte = params.maxPrice;
      where.price = priceFilter;
    }

    // Sort
    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    switch (params.sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'price-asc': orderBy = { price: 'asc' }; break;
      case 'price-desc': orderBy = { price: 'desc' }; break;
    }

    const page = params.page || 1;
    const limit = params.limit || 12;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: listingInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      data: listings.map(formatListing),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Lấy chi tiết tin đăng.
   */
  async getListing(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: listingInclude,
    });
    if (!listing) throw new NotFoundError('Tin đăng không tồn tại hoặc đã bị xoá.');
    return formatListing(listing);
  },

  /**
   * Tạo tin đăng mới.
   */
  async createListing(
    userId: string,
    data: { title: string; category: string; description: string; price: number; negotiable: boolean; condition: string },
    files: Express.Multer.File[],
  ) {
    // Upload ảnh lên Cloudinary
    const imageUploads = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, 'secondlife/listings')),
    );

    const mappedCondition = conditionMap[data.condition] || 'good';

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        category: data.category as PrismaListingCategory,
        description: data.description,
        price: data.price,
        negotiable: data.negotiable,
        condition: mappedCondition,
        sellerId: userId,
        images: {
          create: imageUploads.map((img) => ({
            url: img.url,
            publicId: img.publicId,
          })),
        },
      },
      include: listingInclude,
    });

    return formatListing(listing);
  },

  /**
   * Cập nhật tin đăng.
   */
  async updateListing(
    id: string,
    userId: string,
    data: Record<string, any>,
    files: Express.Multer.File[],
  ) {
    const listing = await prisma.listing.findUnique({ where: { id }, include: { images: true } });
    if (!listing) throw new NotFoundError('Tin đăng không tồn tại.');
    if (listing.sellerId !== userId) throw new ForbiddenError('Bạn không có quyền chỉnh sửa tin này.');

    // Remove images
    if (data.removedImageIds) {
      try {
        const removedIds: string[] = JSON.parse(data.removedImageIds);
        const imagesToRemove = listing.images.filter((img) => removedIds.includes(img.id));
        // Xoá khỏi Cloudinary
        await Promise.all(
          imagesToRemove
            .filter((img) => img.publicId)
            .map((img) => deleteFromCloudinary(img.publicId!)),
        );
        // Xoá khỏi DB
        await prisma.listingImage.deleteMany({
          where: { id: { in: removedIds }, listingId: id },
        });
      } catch {
        // ignore parse errors
      }
    }

    // Upload ảnh mới
    if (files.length > 0) {
      const imageUploads = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, 'secondlife/listings')),
      );
      await prisma.listingImage.createMany({
        data: imageUploads.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          listingId: id,
        })),
      });
    }

    // Update listing fields
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.category) updateData.category = data.category;
    if (data.description) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.negotiable !== undefined) updateData.negotiable = data.negotiable === true || data.negotiable === 'true';
    if (data.condition) {
      const mapped = conditionMap[data.condition];
      if (mapped) updateData.condition = mapped;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: listingInclude,
    });

    return formatListing(updated);
  },

  /**
   * Cập nhật trạng thái tin đăng.
   */
  async updateStatus(id: string, userId: string, status: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundError('Tin đăng không tồn tại.');
    if (listing.sellerId !== userId) throw new ForbiddenError('Bạn không có quyền thay đổi trạng thái tin này.');

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: status as Prisma.EnumListingStatusFieldUpdateOperationsInput['set'] },
      include: listingInclude,
    });

    return formatListing(updated);
  },

  /**
   * Xoá tin đăng.
   */
  async deleteListing(id: string, userId: string) {
    const listing = await prisma.listing.findUnique({ where: { id }, include: { images: true } });
    if (!listing) throw new NotFoundError('Tin đăng không tồn tại.');
    if (listing.sellerId !== userId) throw new ForbiddenError('Bạn không có quyền xoá tin này.');

    // Xoá ảnh trên Cloudinary
    await Promise.all(
      listing.images
        .filter((img) => img.publicId)
        .map((img) => deleteFromCloudinary(img.publicId!)),
    );

    await prisma.listing.delete({ where: { id } });
  },
};

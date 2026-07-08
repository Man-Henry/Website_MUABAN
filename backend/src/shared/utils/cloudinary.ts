/**
 * @fileoverview Helper upload ảnh lên Cloudinary.
 */

import cloudinary from '../../config/cloudinary.js';

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload buffer ảnh lên Cloudinary.
 * @param buffer - Buffer dữ liệu ảnh
 * @param folder - Thư mục trên Cloudinary (vd: 'secondlife/listings')
 */
export const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      })
      .end(buffer);
  });
};

/**
 * Xoá ảnh khỏi Cloudinary theo public_id.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

/**
 * @fileoverview Cấu hình Multer cho upload ảnh.
 * Lưu file tạm vào memory, sau đó upload lên Cloudinary.
 */

import multer from 'multer';
import { ValidationError } from '../errors/AppError.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ValidationError('Chỉ chấp nhận file hình ảnh (JPEG, PNG, WebP).'));
  }
};

/** Upload cho ảnh sản phẩm (tối đa 5 ảnh) */
export const uploadListingImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
}).array('images', 5);

/** Upload cho ảnh đại diện (1 ảnh) */
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('avatar');

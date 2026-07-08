import React, { useState, useCallback } from 'react';
import type { ListingImage } from '../types/listing.types';

// ===== Props Interface =====
interface ImageGalleryProps {
  images: ListingImage[];
  alt?: string;
}

// ===== Component =====
const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt = 'Sản phẩm' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-surface-container flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] text-outline/30">
            image
          </span>
          <p className="mt-2 text-body-sm text-on-surface-variant">Chưa có hình ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container group">
        <img
          src={selectedImage?.url}
          alt={`${alt} - Ảnh ${selectedIndex + 1}`}
          className="h-full w-full object-contain"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-md text-on-surface opacity-0 group-hover:opacity-100 hover:bg-surface-container-lowest transition-all duration-200 cursor-pointer"
              aria-label="Ảnh trước"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-md text-on-surface opacity-0 group-hover:opacity-100 hover:bg-surface-container-lowest transition-all duration-200 cursor-pointer"
              aria-label="Ảnh tiếp"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-surface-container-lowest/80 backdrop-blur-sm px-2.5 py-1 text-label-sm text-on-surface">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`
                shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
                ${
                  index === selectedIndex
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                    : 'border-transparent hover:border-outline-variant opacity-70 hover:opacity-100'
                }
              `}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img
                src={image.url}
                alt={`${alt} - Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

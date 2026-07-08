import React, { useCallback } from 'react';
import DropZone from '../../components/DropZone';
import type { ListingImage } from '../../types';

// ===== Props Interface =====
interface EditImageStepProps {
  /** Ảnh hiện tại từ server */
  existingImages: ListingImage[];
  /** IDs ảnh đã đánh dấu xoá */
  removedImageIds: string[];
  /** Ảnh mới (File[]) chưa upload */
  newImages: File[];
  /** Previews cho ảnh mới */
  newPreviews: { id: string; url: string }[];
  /** Callback khi đánh dấu/bỏ xoá ảnh cũ */
  onToggleRemoveImage: (imageId: string) => void;
  /** Callback khi thêm ảnh mới */
  onNewImagesChange: (images: File[]) => void;
  /** Callback khi thay đổi previews ảnh mới */
  onNewPreviewsChange: (previews: { id: string; url: string }[]) => void;
}

const MAX_IMAGES = 5;

// ===== Component =====
const EditImageStep: React.FC<EditImageStepProps> = ({
  existingImages,
  removedImageIds,
  newImages,
  newPreviews,
  onToggleRemoveImage,
  onNewImagesChange,
  onNewPreviewsChange,
}) => {
  const activeExistingCount = existingImages.filter((img) => !removedImageIds.includes(img.id)).length;
  const totalImages = activeExistingCount + newImages.length;
  const canAddMore = totalImages < MAX_IMAGES;

  // Handle new files from DropZone
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const remaining = MAX_IMAGES - totalImages;
      const filesToAdd = files.slice(0, remaining);
      const updatedImages = [...newImages, ...filesToAdd];
      onNewImagesChange(updatedImages);

      const updatedPreviews = filesToAdd.map((file) => ({
        id: `new-${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: URL.createObjectURL(file),
      }));
      onNewPreviewsChange([...newPreviews, ...updatedPreviews]);
    },
    [newImages, newPreviews, totalImages, onNewImagesChange, onNewPreviewsChange]
  );

  // Remove a newly added preview
  const handleRemoveNewPreview = useCallback(
    (id: string) => {
      const index = newPreviews.findIndex((p) => p.id === id);
      if (index === -1) return;

      URL.revokeObjectURL(newPreviews[index].url);
      onNewPreviewsChange(newPreviews.filter((p) => p.id !== id));
      onNewImagesChange(newImages.filter((_, i) => i !== index));
    },
    [newImages, newPreviews, onNewImagesChange, onNewPreviewsChange]
  );

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">photo_library</span>
          Quản lý hình ảnh
        </h2>
        <p className="mt-1.5 text-body-sm text-on-surface-variant">
          Xoá ảnh không cần thiết và thêm ảnh mới. Tối đa {MAX_IMAGES} ảnh.
        </p>
      </div>

      {/* Image counter */}
      <div className="flex items-center gap-2 text-label-sm">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
          totalImages === 0
            ? 'bg-error-container/30 text-error'
            : totalImages >= MAX_IMAGES
              ? 'bg-tertiary-container/30 text-tertiary'
              : 'bg-primary-container/20 text-primary'
        }`}>
          <span className="material-symbols-outlined text-[14px]">image</span>
          {totalImages} / {MAX_IMAGES} ảnh
        </span>
      </div>

      {/* ===== Existing Images ===== */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">cloud_done</span>
            Ảnh hiện tại
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {existingImages.map((img) => {
              const isRemoved = removedImageIds.includes(img.id);
              return (
                <div
                  key={img.id}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden border-2 group
                    transition-all duration-200
                    ${isRemoved
                      ? 'border-error/40 opacity-50 grayscale'
                      : 'border-outline-variant hover:border-primary/40'
                    }
                  `}
                >
                  <img
                    src={img.url}
                    alt="Ảnh sản phẩm"
                    className="h-full w-full object-cover"
                  />

                  {/* Overlay */}
                  <div className={`
                    absolute inset-0 transition-colors duration-200
                    ${isRemoved ? 'bg-error/10' : 'bg-black/0 group-hover:bg-black/15'}
                  `} />

                  {/* Removed indicator */}
                  {isRemoved && (
                    <div className="absolute inset-0 flex items-center justify-center fade-in">
                      <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-[28px] text-error">delete</span>
                        <span className="text-[10px] font-semibold text-error bg-surface/80 px-2 py-0.5 rounded-full">
                          Sẽ xoá
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Toggle remove button */}
                  <button
                    type="button"
                    onClick={() => onToggleRemoveImage(img.id)}
                    className={`
                      absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full
                      shadow-md transition-all duration-200 cursor-pointer
                      ${isRemoved
                        ? 'bg-primary text-on-primary opacity-100 hover:bg-primary/90'
                        : 'bg-error text-on-error opacity-0 group-hover:opacity-100 hover:bg-error/90'
                      }
                    `}
                    aria-label={isRemoved ? 'Hoàn tác xoá' : 'Xoá ảnh'}
                    title={isRemoved ? 'Hoàn tác xoá' : 'Xoá ảnh'}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isRemoved ? 'undo' : 'close'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Add New Images ===== */}
      {canAddMore && (
        <div className="space-y-3">
          <h3 className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">add_photo_alternate</span>
            Thêm ảnh mới
          </h3>
          <DropZone
            onFilesSelected={handleFilesSelected}
            maxFiles={MAX_IMAGES - activeExistingCount}
            maxSizeMB={5}
            previews={newPreviews}
            onRemovePreview={handleRemoveNewPreview}
          />
        </div>
      )}

      {/* Max reached notice */}
      {!canAddMore && newPreviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">add_photo_alternate</span>
            Ảnh mới đã thêm
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {newPreviews.map((preview) => (
              <div
                key={preview.id}
                className="relative aspect-square rounded-xl overflow-hidden border border-primary/30 group"
              >
                <img
                  src={preview.url}
                  alt="Ảnh mới"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewPreview(preview.id)}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-error text-on-error shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-error/90 cursor-pointer"
                  aria-label="Xoá ảnh mới"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      {totalImages > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-primary-container/10 border border-primary/10 px-4 py-3 fade-in">
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">tips_and_updates</span>
          <p className="text-label-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Mẹo:</span>{' '}
            Nhấn vào nút <span className="text-error">✕</span> trên ảnh cũ để đánh dấu xoá. Nhấn <span className="text-primary">↩</span> để hoàn tác.
          </p>
        </div>
      )}

      {/* Warning if no images */}
      {totalImages === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-error-container/30 border border-error/20 px-4 py-3 text-body-sm text-error fade-in">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Tin đăng cần ít nhất 1 hình ảnh. Vui lòng giữ lại hoặc thêm ảnh mới.
        </div>
      )}
    </div>
  );
};

export default EditImageStep;

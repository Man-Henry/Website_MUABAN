import React, { useCallback } from 'react';
import DropZone from '../../components/DropZone';

// ===== Props Interface =====
interface ImageUploadStepProps {
  images: File[];
  previews: { id: string; url: string }[];
  onImagesChange: (images: File[]) => void;
  onPreviewsChange: (previews: { id: string; url: string }[]) => void;
}

// ===== Component =====
const ImageUploadStep: React.FC<ImageUploadStepProps> = ({
  images,
  previews,
  onImagesChange,
  onPreviewsChange,
}) => {
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newImages = [...images, ...files];
      onImagesChange(newImages);

      const newPreviews = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: URL.createObjectURL(file),
      }));
      onPreviewsChange([...previews, ...newPreviews]);
    },
    [images, previews, onImagesChange, onPreviewsChange]
  );

  const handleRemovePreview = useCallback(
    (id: string) => {
      const index = previews.findIndex((p) => p.id === id);
      if (index === -1) return;

      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(previews[index].url);

      const newPreviews = previews.filter((p) => p.id !== id);
      const newImages = images.filter((_, i) => i !== index);

      onPreviewsChange(newPreviews);
      onImagesChange(newImages);
    },
    [images, previews, onImagesChange, onPreviewsChange]
  );

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">photo_library</span>
          Tải lên hình ảnh
        </h2>
        <p className="mt-1.5 text-body-sm text-on-surface-variant">
          Thêm ảnh chất lượng cao để thu hút người mua. Ảnh đầu tiên sẽ là ảnh bìa.
        </p>
      </div>

      {/* Drop zone */}
      <DropZone
        onFilesSelected={handleFilesSelected}
        maxFiles={5}
        maxSizeMB={5}
        previews={previews}
        onRemovePreview={handleRemovePreview}
      />

      {/* Tip */}
      {previews.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-primary-container/10 border border-primary/10 px-4 py-3 fade-in">
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">tips_and_updates</span>
          <p className="text-label-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Mẹo:</span>{' '}
            Chụp ảnh trong điều kiện ánh sáng tốt, nhiều góc độ để tăng độ tin cậy.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadStep;

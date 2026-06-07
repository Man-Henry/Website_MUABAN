import React, { useRef, useState, useCallback } from 'react';

// ===== Props Interface =====
interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  previews?: { id: string; url: string }[];
  onRemovePreview?: (id: string) => void;
}

// ===== Component =====
const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 5,
  previews = [],
  onRemovePreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null);
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const remainingSlots = maxFiles - previews.length;

      if (remainingSlots <= 0) {
        setError(`Tối đa ${maxFiles} ảnh.`);
        return [];
      }

      const valid: File[] = [];
      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          setError('Chỉ chấp nhận định dạng JPG, PNG.');
          continue;
        }
        if (file.size > maxSizeBytes) {
          setError(`Mỗi ảnh tối đa ${maxSizeMB}MB.`);
          continue;
        }
        if (valid.length < remainingSlots) {
          valid.push(file);
        }
      }

      return valid;
    },
    [maxFiles, maxSizeMB, previews.length]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      const valid = validateFiles(files);
      if (valid.length > 0) onFilesSelected(valid);
    },
    [onFilesSelected, validateFiles]
  );

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const emptySlots = Math.max(0, maxFiles - previews.length);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center
          py-10 px-6 cursor-pointer
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2
          ${isDragging
            ? 'border-primary bg-primary-container/10 scale-[1.01]'
            : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            flex h-14 w-14 items-center justify-center rounded-2xl mb-4
            transition-colors duration-200
            ${isDragging ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant'}
          `}
        >
          <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
        </div>

        {/* Text */}
        <p className="text-body-md font-medium text-on-surface">
          Nhấn để chọn ảnh
        </p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          hoặc kéo thả vào đây
        </p>
        <p className="mt-3 text-label-sm text-outline">
          Định dạng JPG, PNG. Tối đa {maxSizeMB}MB/ảnh.
        </p>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1.5 text-label-sm text-error fade-in">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}

      {/* Preview grid */}
      {(previews.length > 0 || emptySlots > 0) && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {/* Existing previews */}
          {previews.map((preview) => (
            <div
              key={preview.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant group"
            >
              <img
                src={preview.url}
                alt="Xem trước"
                className="h-full w-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              {/* Remove button */}
              {onRemovePreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePreview(preview.id);
                  }}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-error text-on-error shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-error/90"
                  aria-label="Xóa ảnh"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.min(emptySlots, maxFiles - previews.length) }, (_, i) => (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={handleClick}
              className="aspect-square rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center text-outline hover:border-primary/40 hover:text-primary/60 hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropZone;

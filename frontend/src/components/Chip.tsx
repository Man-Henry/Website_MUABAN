import React from 'react';

// ===== Props Interface =====
interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: string;
}

// ===== Component =====
const Chip: React.FC<ChipProps> = ({ label, selected = false, onClick, icon }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 rounded-full
        px-4 py-2 text-label-md
        border transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-1
        select-none cursor-pointer
        ${selected
          ? 'border-primary bg-primary-container text-on-primary-container shadow-sm'
          : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container hover:border-outline'
        }
      `.trim()}
      aria-pressed={selected}
    >
      {/* Icon */}
      {icon && (
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
            selected ? 'scale-110' : ''
          }`}
        >
          {icon}
        </span>
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Selected check */}
      {selected && (
        <span className="material-symbols-outlined text-[16px] fade-in">
          check
        </span>
      )}
    </button>
  );
};

export default Chip;

import React from 'react';

// ===== Props Interface =====
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

// ===== Component =====
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, labels }) => {
  return (
    <div className="w-full px-4">
      {/* Steps container */}
      <div className="relative flex items-start justify-between">
        {/* Background connecting line */}
        <div className="absolute top-[18px] left-[36px] right-[36px] h-[3px] bg-surface-variant rounded-full" />

        {/* Progress fill line */}
        <div
          className="absolute top-[18px] left-[36px] h-[3px] bg-primary rounded-full transition-all duration-500 ease-out"
          style={{
            width: `calc(${((currentStep - 1) / (totalSteps - 1)) * 100}% - ${
              currentStep === 1 ? 0 : (72 * (totalSteps - currentStep)) / (totalSteps - 1)
            }px)`,
          }}
        />

        {/* Step dots */}
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isInactive = stepNum > currentStep;

          return (
            <div key={stepNum} className="relative z-10 flex flex-col items-center" style={{ width: '72px' }}>
              {/* Step circle */}
              <div
                className={`
                  flex h-9 w-9 items-center justify-center rounded-full
                  text-label-md font-semibold
                  transition-all duration-300 ease-out
                  ${isCompleted
                    ? 'bg-primary text-on-primary shadow-md'
                    : isActive
                      ? 'bg-primary-container text-on-primary-container shadow-lg ring-4 ring-primary-container/30'
                      : 'bg-surface-variant text-on-surface-variant border-2 border-outline-variant'
                  }
                `}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  <span className="text-[14px]">{stepNum}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={`
                  mt-2 text-center text-label-sm leading-tight
                  transition-colors duration-300
                  ${isActive
                    ? 'text-on-surface font-semibold'
                    : isCompleted
                      ? 'text-primary font-medium'
                      : 'text-on-surface-variant'
                  }
                  ${isInactive ? 'opacity-60' : ''}
                `}
              >
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;

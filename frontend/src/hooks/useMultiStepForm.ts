/**
 * @fileoverview Hook tuỳ chỉnh quản lý biểu mẫu nhiều bước (multi-step form).
 * Sử dụng cho các luồng đăng ký, tạo tin đăng, hoặc bất kỳ quy trình
 * nhiều bước nào trong ứng dụng.
 *
 * @example
 * const {
 *   currentStep,
 *   next,
 *   back,
 *   goTo,
 *   isFirstStep,
 *   isLastStep,
 *   progress,
 * } = useMultiStepForm(3);
 *
 * // Hiển thị thanh tiến trình
 * <div style={{ width: `${progress}%` }} />
 *
 * // Điều hướng giữa các bước
 * {!isLastStep && <button onClick={next}>Tiếp theo</button>}
 * {!isFirstStep && <button onClick={back}>Quay lại</button>}
 */

import { useCallback, useMemo, useState } from 'react';

/**
 * Giá trị trả về từ hook useMultiStepForm.
 */
interface UseMultiStepFormReturn {
  /** Bước hiện tại (bắt đầu từ 1) */
  currentStep: number;
  /** Chuyển sang bước tiếp theo. Không làm gì nếu đang ở bước cuối. */
  next: () => void;
  /** Quay lại bước trước. Không làm gì nếu đang ở bước đầu. */
  back: () => void;
  /** Chuyển đến bước cụ thể (1-indexed). Bỏ qua nếu bước không hợp lệ. */
  goTo: (step: number) => void;
  /** Đang ở bước đầu tiên hay không */
  isFirstStep: boolean;
  /** Đang ở bước cuối cùng hay không */
  isLastStep: boolean;
  /** Phần trăm tiến trình (0-100) */
  progress: number;
}

/**
 * Hook quản lý biểu mẫu nhiều bước.
 *
 * Cung cấp state và hàm điều hướng giữa các bước, kèm theo
 * thông tin tiến trình hiển thị cho người dùng.
 *
 * @param totalSteps - Tổng số bước trong biểu mẫu (phải >= 1)
 * @returns Đối tượng chứa trạng thái và hàm điều hướng
 *
 * @example
 * function CreateListingForm() {
 *   const { currentStep, next, back, isLastStep, progress } = useMultiStepForm(3);
 *
 *   return (
 *     <div>
 *       <ProgressBar value={progress} />
 *
 *       {currentStep === 1 && <StepOne />}
 *       {currentStep === 2 && <StepTwo />}
 *       {currentStep === 3 && <StepThree />}
 *
 *       <div className="flex gap-4">
 *         <button onClick={back}>Quay lại</button>
 *         {isLastStep ? (
 *           <button type="submit">Hoàn tất</button>
 *         ) : (
 *           <button onClick={next}>Tiếp theo</button>
 *         )}
 *       </div>
 *     </div>
 *   );
 * }
 */
export function useMultiStepForm(totalSteps: number): UseMultiStepFormReturn {
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * Chuyển sang bước tiếp theo.
   * An toàn: không vượt quá tổng số bước.
   */
  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  /**
   * Quay lại bước trước.
   * An toàn: không giảm xuống dưới bước 1.
   */
  const back = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  /**
   * Chuyển đến bước cụ thể.
   * Bỏ qua nếu bước không nằm trong phạm vi [1, totalSteps].
   *
   * @param step - Số bước muốn chuyển đến (1-indexed)
   */
  const goTo = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  /** Đang ở bước đầu tiên */
  const isFirstStep = currentStep === 1;

  /** Đang ở bước cuối cùng */
  const isLastStep = currentStep === totalSteps;

  /**
   * Phần trăm tiến trình (0-100).
   * Công thức: (currentStep / totalSteps) * 100
   * Bước 1 / 3 = 33.33%, Bước 2 / 3 = 66.67%, Bước 3 / 3 = 100%
   */
  const progress = useMemo(() => {
    if (totalSteps <= 0) return 0;
    return Math.round((currentStep / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  return {
    currentStep,
    next,
    back,
    goTo,
    isFirstStep,
    isLastStep,
    progress,
  };
}

export default useMultiStepForm;

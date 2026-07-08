import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiStepForm } from '../hooks/useMultiStepForm';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { createNewListing } from '../redux/slices/listingSlice';
import { useToast } from '../context/ToastContext';
import StepIndicator from '../components/StepIndicator';
import Button from '../components/Button';
import ImageUploadStep from '../features/listing/ImageUploadStep';
import InfoStep from '../features/listing/InfoStep';
import PricingStep from '../features/listing/PricingStep';
import ReviewStep from '../features/listing/ReviewStep';
import type { ListingFormData, ListingCategory, ListingCondition } from '../types';

const STEP_LABELS = ['Hình ảnh', 'Thông tin', 'Giá & Tình trạng', 'Xem lại'];

const TOTAL_STEPS = 4;

const PostListing: React.FC = () => {
  const { currentStep, next, back, isFirstStep, isLastStep } =
    useMultiStepForm(TOTAL_STEPS);

  const dispatch = useAppDispatch();
  const { isCreating } = useAppSelector((state) => state.listing);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ===== Global form state =====
  const [formData, setFormData] = useState<ListingFormData>({
    images: [],
    previews: [],
    name: '',
    category: '',
    description: '',
    price: '',
    negotiable: false,
    condition: '',
  });

  // ===== Step validation errors =====
  const [stepErrors, setStepErrors] = useState<string | null>(null);

  // ===== Update helpers =====
  const updateField = useCallback(
    <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setStepErrors(null); // Clear errors when user edits
    },
    []
  );

  // ===== Step validation =====
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (formData.images.length === 0) {
          setStepErrors('Vui lòng tải lên ít nhất 1 hình ảnh.');
          return false;
        }
        return true;
      case 2:
        if (!formData.name.trim()) {
          setStepErrors('Vui lòng nhập tên sản phẩm.');
          return false;
        }
        if (!formData.category) {
          setStepErrors('Vui lòng chọn danh mục sản phẩm.');
          return false;
        }
        if (formData.description.trim().length < 10) {
          setStepErrors('Mô tả sản phẩm cần ít nhất 10 ký tự.');
          return false;
        }
        return true;
      case 3:
        if (!formData.price || Number(formData.price) <= 0) {
          setStepErrors('Vui lòng nhập giá sản phẩm hợp lệ.');
          return false;
        }
        if (!formData.condition) {
          setStepErrors('Vui lòng chọn tình trạng sản phẩm.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // ===== Handle next with validation =====
  const handleNext = () => {
    if (validateCurrentStep()) {
      setStepErrors(null);
      next();
    }
  };

  // ===== Handle submit =====
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    // Build FormData for multipart upload
    const payload = new FormData();
    payload.append('title', formData.name.trim());
    payload.append('category', formData.category);
    payload.append('description', formData.description.trim());
    payload.append('price', formData.price);
    payload.append('negotiable', String(formData.negotiable));
    payload.append('condition', formData.condition);

    formData.images.forEach((file) => {
      payload.append('images', file);
    });

    const result = await dispatch(createNewListing(payload));

    if (createNewListing.fulfilled.match(result)) {
      showToast({
        type: 'success',
        message: 'Đăng tin thành công! Sản phẩm của bạn đã được đăng lên cửa hàng. 🎉',
      });
      navigate('/cua-hang');
    } else {
      showToast({
        type: 'error',
        message: (result.payload as string) || 'Đăng tin thất bại. Vui lòng thử lại.',
      });
    }
  };

  // ===== Render current step =====
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ImageUploadStep
            images={formData.images}
            previews={formData.previews}
            onImagesChange={(images) => updateField('images', images)}
            onPreviewsChange={(previews) => updateField('previews', previews)}
          />
        );
      case 2:
        return (
          <InfoStep
            name={formData.name}
            category={formData.category}
            description={formData.description}
            onNameChange={(v) => updateField('name', v)}
            onCategoryChange={(v) => updateField('category', v as ListingCategory | '')}
            onDescriptionChange={(v) => updateField('description', v)}
          />
        );
      case 3:
        return (
          <PricingStep
            price={formData.price}
            negotiable={formData.negotiable}
            condition={formData.condition}
            onPriceChange={(v) => updateField('price', v)}
            onNegotiableChange={(v) => updateField('negotiable', v)}
            onConditionChange={(v) => updateField('condition', v as ListingCondition | '')}
          />
        );
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* ===== Page Header ===== */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-headline-md md:text-headline-lg text-on-surface">
            Đăng tin sản phẩm
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Chia sẻ sản phẩm của bạn với cộng đồng bền vững
          </p>
        </div>

        {/* ===== Step Indicator ===== */}
        <div className="mb-8 md:mb-10">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            labels={STEP_LABELS}
          />
        </div>

        {/* ===== Form Card ===== */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Validation error */}
            {stepErrors && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-error-container/30 border border-error/20 px-4 py-3 text-body-sm text-error fade-in">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                {stepErrors}
              </div>
            )}

            {/* Step content with transition */}
            <div key={currentStep} className="fade-in">
              {renderStep()}
            </div>
          </div>

          {/* ===== Navigation Buttons ===== */}
          <div className="flex items-center justify-between border-t border-outline-variant/20 px-6 md:px-8 py-5 bg-surface-container-low/30">
            {/* Back button */}
            <div>
              {!isFirstStep && (
                <Button
                  variant="outline"
                  icon="arrow_back"
                  onClick={back}
                >
                  Quay lại
                </Button>
              )}
            </div>

            {/* Next / Submit */}
            <div>
              {isLastStep ? (
                <Button
                  icon="check_circle"
                  onClick={handleSubmit}
                  loading={isCreating}
                >
                  Đăng tin ngay
                </Button>
              ) : (
                <Button
                  icon="arrow_forward"
                  iconPosition="right"
                  onClick={handleNext}
                >
                  Tiếp tục
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostListing;

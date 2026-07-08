import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMultiStepForm } from '../hooks/useMultiStepForm';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchListingById, editListing } from '../redux/slices/listingSlice';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import StepIndicator from '../components/StepIndicator';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EditImageStep from '../features/listing/EditImageStep';
import InfoStep from '../features/listing/InfoStep';
import PricingStep from '../features/listing/PricingStep';
import ReviewStep from '../features/listing/ReviewStep';
import type { EditListingFormData, ListingCategory, ListingCondition } from '../types';

const STEP_LABELS = ['Hình ảnh', 'Thông tin', 'Giá & Tình trạng', 'Xem lại'];
const TOTAL_STEPS = 4;

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { selectedListing, isDetailLoading, isUpdating } = useAppSelector((state) => state.listing);

  const { currentStep, next, back, isFirstStep, isLastStep } =
    useMultiStepForm(TOTAL_STEPS);

  // ===== Load listing data =====
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchListingById(id));
    }
  }, [id, dispatch]);

  // ===== Form state =====
  const [formData, setFormData] = useState<EditListingFormData>({
    images: [],
    previews: [],
    name: '',
    category: '',
    description: '',
    price: '',
    negotiable: false,
    condition: '',
    existingImages: [],
    removedImageIds: [],
  });

  // ===== Pre-fill form when listing loads =====
  useEffect(() => {
    if (selectedListing && !isInitialized) {
      // Check ownership
      if (user && selectedListing.seller?.id !== user.id) {
        showToast({ type: 'error', message: 'Bạn không có quyền chỉnh sửa tin này.' });
        navigate('/tin-dang', { replace: true });
        return;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        images: [],
        previews: [],
        name: selectedListing.title,
        category: selectedListing.category,
        description: selectedListing.description,
        price: String(selectedListing.price),
        negotiable: selectedListing.negotiable,
        condition: selectedListing.condition,
        existingImages: selectedListing.images || [],
        removedImageIds: [],
      });
      setIsInitialized(true);
    }
  }, [selectedListing, isInitialized, user, navigate, showToast]);

  // ===== Step validation errors =====
  const [stepErrors, setStepErrors] = useState<string | null>(null);

  // ===== Update helpers =====
  const updateField = useCallback(
    <K extends keyof EditListingFormData>(key: K, value: EditListingFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setStepErrors(null);
    },
    []
  );

  // ===== Toggle remove existing image =====
  const handleToggleRemoveImage = useCallback((imageId: string) => {
    setFormData((prev) => {
      const isAlreadyRemoved = prev.removedImageIds.includes(imageId);
      return {
        ...prev,
        removedImageIds: isAlreadyRemoved
          ? prev.removedImageIds.filter((id) => id !== imageId)
          : [...prev.removedImageIds, imageId],
      };
    });
    setStepErrors(null);
  }, []);

  // ===== Step validation =====
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: {
        const activeExisting = formData.existingImages.filter(
          (img) => !formData.removedImageIds.includes(img.id)
        ).length;
        const totalImages = activeExisting + formData.images.length;
        if (totalImages === 0) {
          setStepErrors('Tin đăng cần ít nhất 1 hình ảnh.');
          return false;
        }
        return true;
      }
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
    if (!validateCurrentStep() || !id) return;

    const payload = new FormData();
    payload.append('title', formData.name.trim());
    payload.append('category', formData.category);
    payload.append('description', formData.description.trim());
    payload.append('price', formData.price);
    payload.append('negotiable', String(formData.negotiable));
    payload.append('condition', formData.condition);

    // Removed image IDs
    if (formData.removedImageIds.length > 0) {
      payload.append('removedImageIds', JSON.stringify(formData.removedImageIds));
    }

    // New images
    formData.images.forEach((file) => {
      payload.append('images', file);
    });

    const result = await dispatch(editListing({ id, payload }));

    if (editListing.fulfilled.match(result)) {
      showToast({
        type: 'success',
        message: 'Cập nhật tin đăng thành công! 🎉',
      });
      navigate(`/san-pham/${id}`);
    } else {
      showToast({
        type: 'error',
        message: (result.payload as string) || 'Cập nhật thất bại. Vui lòng thử lại.',
      });
    }
  };

  // ===== Render current step =====
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EditImageStep
            existingImages={formData.existingImages}
            removedImageIds={formData.removedImageIds}
            newImages={formData.images}
            newPreviews={formData.previews}
            onToggleRemoveImage={handleToggleRemoveImage}
            onNewImagesChange={(images) => updateField('images', images)}
            onNewPreviewsChange={(previews) => updateField('previews', previews)}
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

  // ===== Loading state =====
  if (isDetailLoading || !isInitialized) {
    return (
      <div className="page-enter">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner />
            <p className="text-body-md text-on-surface-variant">Đang tải thông tin tin đăng...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== Not found =====
  if (!selectedListing) {
    return (
      <div className="page-enter">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
            <h2 className="text-headline-sm text-on-surface">Không tìm thấy tin đăng</h2>
            <p className="text-body-md text-on-surface-variant">
              Tin đăng không tồn tại hoặc đã bị xoá.
            </p>
            <Button icon="arrow_back" variant="outline" onClick={() => navigate('/tin-dang')}>
              Quay lại tin đã đăng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* ===== Page Header ===== */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-headline-md md:text-headline-lg text-on-surface">
            Chỉnh sửa tin đăng
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Cập nhật thông tin sản phẩm của bạn
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
                  icon="save"
                  onClick={handleSubmit}
                  loading={isUpdating}
                >
                  Lưu thay đổi
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

        {/* ===== Cancel link ===== */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Huỷ và quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditListing;

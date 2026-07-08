import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound: React.FC = () => {
  return (
    <div className="page-enter flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Animated illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-40 rounded-full bg-primary-container/10 animate-pulse" />
        </div>
        <div className="relative flex items-center justify-center">
          <span className="text-[120px] font-bold text-primary/10 leading-none select-none">
            404
          </span>
        </div>
      </div>

      {/* Content */}
      <h1 className="text-headline-md md:text-headline-lg text-on-surface mb-3">
        Trang không tồn tại
      </h1>
      <p className="text-body-md text-on-surface-variant max-w-md mb-8 leading-relaxed">
        Trang bạn đang tìm kiếm có thể đã bị xoá, đổi tên, hoặc tạm thời không khả dụng.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button icon="home" size="lg">
            Về trang chủ
          </Button>
        </Link>
        <Link to="/cua-hang">
          <Button variant="outline" icon="storefront" size="lg">
            Đến cửa hàng
          </Button>
        </Link>
      </div>

      {/* Decorative eco elements */}
      <div className="mt-12 flex items-center gap-2 text-outline/40">
        <span className="material-symbols-outlined text-[20px]">eco</span>
        <span className="text-label-sm">Sustainable Exchange</span>
        <span className="material-symbols-outlined text-[20px]">eco</span>
      </div>
    </div>
  );
};

export default NotFound;

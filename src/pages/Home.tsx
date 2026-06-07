import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

// ===== Feature cards data =====
const features = [
  {
    icon: 'bolt',
    title: 'Đăng tin nhanh chóng',
    description: 'Chỉ vài bước đơn giản, sản phẩm của bạn sẽ được hàng nghìn người nhìn thấy ngay lập tức.',
  },
  {
    icon: 'verified_user',
    title: 'Cộng đồng tin cậy',
    description: 'Hệ thống đánh giá minh bạch giúp bạn giao dịch an toàn và yên tâm với mọi đơn hàng.',
  },
  {
    icon: 'park',
    title: 'Bảo vệ môi trường',
    description: 'Mỗi sản phẩm tái sử dụng giúp giảm rác thải và bảo vệ hành tinh xanh của chúng ta.',
  },
];

// ===== Stats data =====
const stats = [
  { value: '12,000+', label: 'Sản phẩm' },
  { value: '5,000+', label: 'Người dùng' },
  { value: '98%', label: 'Hài lòng' },
];

// ===== Component =====
const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-enter">
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden">
        {/* Background gradient decorations */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="absolute top-40 -left-32 h-72 w-72 rounded-full bg-secondary-container/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-container/15 border border-primary/10 px-4 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">eco</span>
              <span className="text-label-sm text-primary font-medium">Nền tảng xanh #1 Việt Nam</span>
            </div>

            {/* Headline */}
            <h1 className="text-headline-lg-mobile md:text-display-lg text-on-surface leading-tight">
              Trao đổi bền vững,{' '}
              <span className="text-primary">sống xanh</span>{' '}
              mỗi ngày
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Kết nối cộng đồng yêu môi trường. Mua bán, trao đổi đồ cũ chất lượng — tiết kiệm chi phí, bảo vệ hành tinh.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                icon="explore"
                onClick={() => navigate('/cua-hang')}
              >
                Khám phá ngay
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon="edit_square"
                onClick={() => navigate('/dang-tin')}
              >
                Đăng tin miễn phí
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-14 flex items-center justify-center gap-8 md:gap-14">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-headline-md md:text-headline-lg text-primary font-bold">
                    {stat.value}
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="bg-surface-container-low/50 border-y border-outline-variant/20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-24">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-headline-md md:text-headline-lg text-on-surface">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant max-w-md mx-auto">
              Trải nghiệm mua bán xanh — đơn giản, an toàn và có ý nghĩa.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/15 text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-300">
                  <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-headline-sm text-on-surface mb-3">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-primary/60 mb-4 block">
            recycling
          </span>
          <h2 className="text-headline-md md:text-headline-lg text-on-primary mb-4">
            Bắt đầu hành trình xanh của bạn
          </h2>
          <p className="text-body-md text-on-primary/80 max-w-lg mx-auto mb-8">
            Đăng ký miễn phí và trở thành một phần của cộng đồng sống bền vững lớn nhất Việt Nam.
          </p>
          <Link
            to="/dang-ky"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-label-md font-semibold text-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Tạo tài khoản miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

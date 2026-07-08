import React from 'react';

const About: React.FC = () => (
  <div className="page-enter">
    <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[36px]">eco</span>
          <h1 className="text-display-sm text-on-surface">Sustainable Exchange</h1>
        </div>
        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Nền tảng mua bán đồ cũ hàng đầu Việt Nam — nơi mỗi sản phẩm đều có cơ hội
          được sử dụng lại, giảm rác thải và bảo vệ môi trường.
        </p>
      </div>

      {/* Mission */}
      <div className="space-y-8">
        <Section
          icon="target"
          title="Sứ mệnh"
          content="Chúng tôi tin rằng mỗi sản phẩm đều xứng đáng có một cuộc đời thứ hai. SecondLife kết nối người mua và người bán, tạo nên một cộng đồng tiêu dùng bền vững, giảm thiểu lãng phí tài nguyên."
        />
        <Section
          icon="visibility"
          title="Tầm nhìn"
          content="Trở thành nền tảng hàng đầu Đông Nam Á về giao dịch đồ dùng bền vững, nơi mọi người cùng chung tay xây dựng lối sống xanh."
        />
        <Section
          icon="favorite"
          title="Giá trị cốt lõi"
          content="Bền vững — Minh bạch — Cộng đồng — Đổi mới. Chúng tôi đặt môi trường và người dùng làm trung tâm trong mọi quyết định."
        />
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8">
        <StatItem value="10K+" label="Người dùng" />
        <StatItem value="50K+" label="Sản phẩm" />
        <StatItem value="100+" label="Tấn CO₂ giảm" />
      </div>
    </div>
  </div>
);

const Section: React.FC<{ icon: string; title: string; content: string }> = ({ icon, title, content }) => (
  <div className="flex gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container/15">
      <span className="material-symbols-outlined text-primary text-[24px]">{icon}</span>
    </div>
    <div>
      <h2 className="text-headline-sm text-on-surface mb-2">{title}</h2>
      <p className="text-body-md text-on-surface-variant leading-relaxed">{content}</p>
    </div>
  </div>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-headline-md md:text-headline-lg text-primary font-bold">{value}</p>
    <p className="text-label-sm text-on-surface-variant mt-1">{label}</p>
  </div>
);

export default About;

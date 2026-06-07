import React from 'react';

const Terms: React.FC = () => (
  <div className="page-enter">
    <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-headline-lg text-on-surface mb-2">Điều khoản sử dụng</h1>
      <p className="text-body-sm text-on-surface-variant mb-8">Cập nhật lần cuối: 01/06/2026</p>

      <div className="prose-custom space-y-6">
        <PolicySection title="1. Chấp nhận điều khoản">
          Bằng việc truy cập và sử dụng nền tảng SecondLife (Sustainable Exchange), bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.
        </PolicySection>
        <PolicySection title="2. Tài khoản người dùng">
          Bạn phải cung cấp thông tin chính xác khi đăng ký tài khoản. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và tất cả hoạt động diễn ra dưới tài khoản của mình.
        </PolicySection>
        <PolicySection title="3. Quy tắc đăng tin">
          Sản phẩm đăng bán phải hợp pháp, mô tả trung thực và có hình ảnh thực tế. Nghiêm cấm đăng tin sản phẩm giả mạo, vi phạm pháp luật hoặc gây nhầm lẫn.
        </PolicySection>
        <PolicySection title="4. Giao dịch">
          SecondLife là nền tảng kết nối. Chúng tôi không chịu trách nhiệm về chất lượng sản phẩm hay tranh chấp giữa các bên. Khuyến khích kiểm tra sản phẩm trước khi thanh toán.
        </PolicySection>
        <PolicySection title="5. Quyền sở hữu trí tuệ">
          Nội dung bạn đăng tải vẫn thuộc quyền sở hữu của bạn. Tuy nhiên, bạn cấp cho SecondLife quyền sử dụng nội dung đó để vận hành nền tảng.
        </PolicySection>
        <PolicySection title="6. Liên hệ">
          Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ: <strong>support@secondlife.vn</strong>
        </PolicySection>
      </div>
    </div>
  </div>
);

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-headline-sm text-on-surface mb-2">{title}</h2>
    <p className="text-body-md text-on-surface-variant leading-relaxed">{children}</p>
  </div>
);

export default Terms;

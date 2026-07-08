import React from 'react';

const Privacy: React.FC = () => (
  <div className="page-enter">
    <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-headline-lg text-on-surface mb-2">Chính sách bảo mật</h1>
      <p className="text-body-sm text-on-surface-variant mb-8">Cập nhật lần cuối: 19/06/2026</p>

      <div className="space-y-6">
        <Section title="Thu thập thông tin">
          Chúng tôi thu thập thông tin cần thiết khi bạn đăng ký tài khoản (tên, email) và sử dụng nền tảng (lịch sử duyệt, tin đăng). Thông tin này giúp cải thiện trải nghiệm người dùng.
        </Section>
        <Section title="Sử dụng thông tin">
          Thông tin của bạn được sử dụng để: vận hành tài khoản, hiển thị tin đăng, cải thiện dịch vụ, và gửi thông báo quan trọng. Chúng tôi không bán thông tin cho bên thứ ba.
        </Section>
        <Section title="Bảo mật dữ liệu">
          Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành: mã hoá SSL/TLS, hash mật khẩu, và kiểm soát truy cập chặt chẽ.
        </Section>
        <Section title="Cookie">
          Nền tảng sử dụng cookie cần thiết để duy trì phiên đăng nhập và cải thiện trải nghiệm. Bạn có thể tắt cookie trong trình duyệt, nhưng điều này có thể ảnh hưởng đến chức năng.
        </Section>
        <Section title="Quyền của bạn">
          Bạn có quyền: truy cập, chỉnh sửa, xoá dữ liệu cá nhân; rút lại sự đồng ý; và yêu cầu xuất dữ liệu. Liên hệ <strong>privacy@secondlife.vn</strong> để thực hiện các quyền này.
        </Section>
      </div>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-headline-sm text-on-surface mb-2">{title}</h2>
    <p className="text-body-md text-on-surface-variant leading-relaxed">{children}</p>
  </div>
);

export default Privacy;

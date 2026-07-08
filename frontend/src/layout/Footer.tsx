import React from 'react';
import { Link } from 'react-router-dom';

// ===== Footer Links =====
const footerLinks = [
  { label: 'Điều khoản sử dụng', to: '/dieu-khoan' },
  { label: 'Chính sách bảo mật', to: '/chinh-sach-bao-mat' },
  { label: 'Về chúng tôi', to: '/ve-chung-toi' },
  { label: 'Liên hệ hỗ trợ', to: '/lien-he' },
];

// ===== Component =====
const Footer: React.FC = () => {
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 md:py-14">
        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="material-symbols-outlined text-[28px] text-primary group-hover:scale-110 transition-transform duration-200">
                eco
              </span>
              <span className="text-headline-sm text-primary">
                Sustainable Exchange
              </span>
            </Link>
            <p className="text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
              Nền tảng trao đổi hàng hóa bền vững, kết nối cộng đồng yêu môi trường.
              Mỗi sản phẩm được tái sử dụng là một bước tiến cho Trái Đất.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2 pt-2">
              {['public', 'group', 'favorite'].map((icon) => (
                <div
                  key={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-4">
            <h3 className="text-label-md text-on-surface font-semibold mb-4 uppercase tracking-wider">
              Liên kết
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / CTA */}
          <div className="md:col-span-3">
            <h3 className="text-label-md text-on-surface font-semibold mb-4 uppercase tracking-wider">
              Liên hệ
            </h3>
            <div className="space-y-3 text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                <span>tvm19624@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span>Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-outline-variant/30">
          <p className="text-label-sm text-on-surface-variant text-center">
            © 2026 Sustainable Exchange. Chung tay vì môi trường.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

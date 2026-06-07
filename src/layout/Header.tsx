import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../redux/store';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';

// ===== Nav Links =====
const navLinks = [
  { label: 'Cửa hàng', to: '/cua-hang' },
  { label: 'Về chúng tôi', to: '/ve-chung-toi' },
  { label: 'Liên hệ', to: '/lien-he' },
];

// ===== Unread Message Badge =====
const UnreadBadge: React.FC = () => {
  const totalUnread = useAppSelector((state) => state.message.totalUnread);
  if (totalUnread === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error text-on-error text-[10px] font-bold px-1">
      {totalUnread > 9 ? '9+' : totalUnread}
    </span>
  );
};

// ===== Component =====
const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* ===== Logo ===== */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Trang chủ">
          <span className="material-symbols-outlined text-[28px] text-primary group-hover:scale-110 transition-transform duration-200">
            eco
          </span>
          <span className="text-headline-sm text-primary hidden sm:block">
            Sustainable Exchange
          </span>
        </Link>

        {/* ===== Desktop Nav ===== */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ===== Desktop Search ===== */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <SearchBar variant="compact" className="w-full" />
        </div>

        {/* ===== Desktop Actions ===== */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                size="sm"
                icon="edit_square"
                onClick={() => navigate('/dang-tin')}
              >
                Đăng tin
              </Button>

              {/* Message icon */}
              <Link
                to="/tin-nhan"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Tin nhắn"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <UnreadBadge />
              </Link>

              {/* Bookmark icon */}
              <Link
                to="/da-luu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Tin đã lưu"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
              </Link>

              {/* User menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-surface-container transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-label-md font-bold">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-body-sm text-on-surface max-w-[100px] truncate">
                    {user?.displayName || 'Người dùng'}
                  </span>
                  <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-lg py-2 fade-in">
                    <div className="px-4 py-2 border-b border-outline-variant/20">
                      <p className="text-label-md text-on-surface font-medium truncate">{user?.displayName}</p>
                      <p className="text-label-sm text-on-surface-variant truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/tai-khoan"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/tin-dang"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      Tin đã đăng
                    </Link>
                    <div className="my-1 border-t border-outline-variant/20" />
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-body-sm text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dang-nhap"
                className="px-4 py-2 text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Đăng nhập
              </Link>
              <Button
                size="sm"
                icon="edit_square"
                onClick={() => navigate('/dang-tin')}
              >
                Đăng tin
              </Button>
            </>
          )}
        </div>

        {/* ===== Mobile Actions ===== */}
        <div className="flex md:hidden items-center gap-1">
          {/* Search toggle */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMobileMenuOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Tìm kiếm"
          >
            <span className="material-symbols-outlined text-[22px]">
              {searchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ===== Mobile Search Bar ===== */}
      {searchOpen && (
        <div className="md:hidden border-t border-outline-variant/20 px-4 py-3 fade-in">
          <SearchBar
            variant="compact"
            autoFocus
            onClose={() => setSearchOpen(false)}
            className="w-full"
          />
        </div>
      )}

      {/* ===== Mobile Menu ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface-container-lowest fade-in">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-outline-variant/20 px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container font-bold">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-label-md text-on-surface font-medium">{user?.displayName}</p>
                    <p className="text-label-sm text-on-surface-variant">{user?.email}</p>
                  </div>
                </div>
                <Button
                  size="md"
                  icon="edit_square"
                  className="w-full"
                  onClick={() => {
                    navigate('/dang-tin');
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng tin
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon="logout"
                  className="w-full text-error"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    navigate('/dang-nhap');
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  size="md"
                  icon="edit_square"
                  className="w-full"
                  onClick={() => {
                    navigate('/dang-tin');
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng tin
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

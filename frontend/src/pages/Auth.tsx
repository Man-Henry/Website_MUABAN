import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validateDisplayName } from '../utils/validators';
import Input from '../components/Input';
import Button from '../components/Button';

// ===== Props Interface =====
interface AuthProps {
  initialTab?: 'login' | 'register';
}

// ===== Component =====
const Auth: React.FC<AuthProps> = ({ initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const { login, register, isLoading, error, resetError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // ===== Login form state =====
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // ===== Register form state =====
  const [registerForm, setRegisterForm] = useState({ displayName: '', email: '', password: '' });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  // Memoize resetError to call when initialTab changes (route navigation)
  // The component already gets a fresh state from useState(initialTab) on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { resetError(); }, [initialTab]);

  // Clear errors on tab switch
  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setLoginErrors({});
    setRegisterErrors({});
    resetError();
  };

  // ===== Login handler =====
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const emailResult = validateEmail(loginForm.email);
    if (!emailResult.valid) errors.email = emailResult.error!;

    const passResult = validatePassword(loginForm.password);
    if (!passResult.valid) errors.password = passResult.error!;

    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await login({
      email: loginForm.email,
      password: loginForm.password,
    });

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  // ===== Register handler =====
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const nameResult = validateDisplayName(registerForm.displayName);
    if (!nameResult.valid) errors.displayName = nameResult.error!;

    const emailResult = validateEmail(registerForm.email);
    if (!emailResult.valid) errors.email = emailResult.error!;

    const passResult = validatePassword(registerForm.password);
    if (!passResult.valid) errors.password = passResult.error!;

    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await register({
      displayName: registerForm.displayName,
      email: registerForm.email,
      password: registerForm.password,
    });

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="page-enter flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-[16px] border border-outline-variant/20 bg-surface-container-lowest shadow-xl overflow-hidden">
          {/* ===== Tabs ===== */}
          <div className="flex border-b border-outline-variant/20">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 py-4 text-label-md font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'login'
                  ? 'text-primary border-b-2 border-primary bg-primary-container/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 py-4 text-label-md font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'register'
                  ? 'text-primary border-b-2 border-primary bg-primary-container/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* ===== Form Content ===== */}
          <div className="p-6 md:p-8">
            {/* API Error */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-error-container/30 border border-error/20 px-4 py-3 text-body-sm text-error fade-in">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                {error}
              </div>
            )}

            {/* ===== Login Form ===== */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5 fade-in">
                <Input
                  label="Email"
                  placeholder="you@email.com"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  error={loginErrors.email}
                />

                <div>
                  <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    error={loginErrors.password}
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      className="text-label-sm text-primary hover:text-primary-container transition-colors cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={isLoading}
                  className="w-full"
                >
                  Đăng nhập
                </Button>
              </form>
            )}

            {/* ===== Register Form ===== */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5 fade-in">
                <Input
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  required
                  value={registerForm.displayName}
                  onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                  error={registerErrors.displayName}
                />

                <Input
                  label="Email"
                  placeholder="you@email.com"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  error={registerErrors.email}
                />

                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  error={registerErrors.password}
                />

                <Button
                  type="submit"
                  size="lg"
                  loading={isLoading}
                  className="w-full"
                >
                  Tạo tài khoản
                </Button>

                <p className="text-label-sm text-on-surface-variant text-center leading-relaxed">
                  Bằng việc đăng ký, bạn đồng ý với{' '}
                  <a href="/dieu-khoan" className="text-primary hover:underline">Điều khoản sử dụng</a>
                  {' '}và{' '}
                  <a href="/chinh-sach-bao-mat" className="text-primary hover:underline">Chính sách bảo mật</a>
                  .
                </p>
              </form>
            )}

            {/* ===== Social Divider ===== */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-outline-variant/40" />
              <span className="text-label-sm text-on-surface-variant">hoặc</span>
              <div className="h-px flex-1 bg-outline-variant/40" />
            </div>

            {/* ===== Social Login Buttons ===== */}
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant px-4 py-3 text-label-md text-on-surface hover:bg-surface-container transition-colors duration-200 cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Tiếp tục với Google
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant px-4 py-3 text-label-md text-on-surface hover:bg-surface-container transition-colors duration-200 cursor-pointer"
              >
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Tiếp tục với Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

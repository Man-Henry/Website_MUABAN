import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      showToast({ type: 'success', message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.' });
      setIsSending(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 800);
  };

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-headline-lg text-on-surface">Liên hệ</h1>
          <p className="mt-2 text-body-md text-on-surface-variant max-w-md mx-auto">
            Có câu hỏi hoặc cần hỗ trợ ? Gửi tin nhắn cho chúng tôi.
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <InfoCard icon="mail" title="Email" value="support@secondlife.vn" />
          <InfoCard icon="schedule" title="Giờ làm việc" value="8:00 - 18:00 (T2-T7)" />
          <InfoCard icon="location_on" title="Địa chỉ" value="TP. Hồ Chí Minh" />
        </div>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8"
        >
          <div className="space-y-5">
            <Input
              label="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ tên của bạn"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <div>
              <label htmlFor="contact-message" className="block text-label-sm text-on-surface-variant mb-2">
                Nội dung
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mô tả vấn đề hoặc câu hỏi..."
                rows={5}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary resize-none transition-all duration-200"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" icon="send" loading={isSending}>
              Gửi liên hệ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: string; title: string; value: string }> = ({ icon, title, value }) => (
  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-center">
    <span className="material-symbols-outlined text-primary text-[24px] mb-2 block">{icon}</span>
    <p className="text-label-sm text-on-surface-variant">{title}</p>
    <p className="text-body-sm text-on-surface font-medium mt-0.5">{value}</p>
  </div>
);

export default Contact;

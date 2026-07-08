import React, { useEffect, useState } from 'react';
import { onSocketStatusChange, type SocketStatus } from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

const GlobalSocketBanner: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SocketStatus>('connected');

  useEffect(() => {
    // Chỉ hiển thị banner khi người dùng đã đăng nhập (vì lúc này mới kết nối socket)
    if (!user) return;

    const unsubscribe = onSocketStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [user]);

  if (!user || status === 'connected') return null;

  const isReconnecting = status === 'reconnecting' || status === 'connecting';

  return (
    <div className={`fixed top-0 left-0 w-full z-50 flex items-center justify-center py-2 transition-all duration-300 shadow-md ${isReconnecting ? 'bg-tertiary text-on-tertiary' : 'bg-error text-on-error'}`}>
      <div className="flex items-center gap-2 px-4 text-label-md font-medium">
        {isReconnecting ? (
          <>
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            <span>Đang kết nối lại với máy chủ... (Bạn có thể bỏ lỡ tin nhắn mới)</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">cloud_off</span>
            <span>Mất kết nối mạng. Hệ thống đang đợi có internet...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalSocketBanner;

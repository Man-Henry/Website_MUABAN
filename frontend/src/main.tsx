import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { checkSession } from './redux/slices/authSlice';
import { connectSocket } from './services/socketService';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './styles/index.css';

// Kiểm tra phiên đăng nhập khi khởi động ứng dụng
// Nếu có phiên hợp lệ → kết nối Socket.IO
store.dispatch(checkSession()).then((result) => {
  if (checkSession.fulfilled.match(result)) {
    connectSocket();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);

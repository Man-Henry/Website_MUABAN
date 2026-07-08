/**
 * @fileoverview Cấu hình Redux store cho ứng dụng Sàn Giao Dịch Bền Vững.
 *
 * Store bao gồm:
 * - authSlice: Quản lý trạng thái xác thực người dùng
 * - listingSlice: Quản lý trạng thái tin đăng sản phẩm
 * - messageSlice: Quản lý trạng thái nhắn tin
 * - bookmarkSlice: Quản lý tin đăng đã lưu
 *
 * Xuất:
 * - store: Redux store instance
 * - RootState: Kiểu trạng thái gốc (dùng với useAppSelector)
 * - AppDispatch: Kiểu dispatch (dùng với useAppDispatch)
 * - useAppDispatch: Hook dispatch đã có kiểu TypeScript
 * - useAppSelector: Hook selector đã có kiểu TypeScript
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import listingReducer from './slices/listingSlice';
import messageReducer from './slices/messageSlice';
import bookmarkReducer from './slices/bookmarkSlice';
import reviewReducer from './slices/reviewSlice';

/**
 * Redux store chính của ứng dụng.
 * Sử dụng configureStore từ Redux Toolkit để tự động cấu hình:
 * - Redux DevTools Extension
 * - redux-thunk middleware
 * - Serializable check middleware
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    listing: listingReducer,
    message: messageReducer,
    bookmark: bookmarkReducer,
    review: reviewReducer,
  },
});

/**
 * Kiểu trạng thái gốc của toàn bộ Redux store.
 * Tự động suy luận từ cấu hình reducer.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Kiểu dispatch đã bao gồm hỗ trợ cho async thunks.
 * Sử dụng kiểu này thay vì Dispatch mặc định để có đầy đủ type safety.
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Hook useDispatch đã được gán kiểu AppDispatch.
 * Sử dụng hook này thay vì useDispatch gốc để có đầy đủ type safety
 * khi dispatch async thunks.
 *
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(loginUser({ email, password }));
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Hook useSelector đã được gán kiểu RootState.
 * Sử dụng hook này thay vì useSelector gốc để không cần khai báo
 * kiểu state mỗi lần sử dụng.
 *
 * @example
 * const { isAuthenticated, user } = useAppSelector((state) => state.auth);
 */
export const useAppSelector = useSelector.withTypes<RootState>();

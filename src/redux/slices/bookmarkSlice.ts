/**
 * @fileoverview Redux slice quản lý bookmark (lưu tin yêu thích).
 * Sử dụng localStorage để lưu trữ offline.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getItem, setItem } from '../../utils/storage';

const STORAGE_KEY = 'sl_bookmarks';

interface BookmarkState {
  /** Danh sách ID tin đăng đã bookmark */
  bookmarkedIds: string[];
}

const initialState: BookmarkState = {
  bookmarkedIds: getItem<string[]>(STORAGE_KEY) || [],
};

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    /** Toggle bookmark cho một tin đăng */
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.bookmarkedIds.indexOf(id);
      if (index >= 0) {
        state.bookmarkedIds.splice(index, 1);
      } else {
        state.bookmarkedIds.unshift(id);
      }
      setItem(STORAGE_KEY, state.bookmarkedIds);
    },
    /** Xoá tất cả bookmark */
    clearAllBookmarks: (state) => {
      state.bookmarkedIds = [];
      setItem(STORAGE_KEY, []);
    },
  },
});

export const { toggleBookmark, clearAllBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;

/**
 * @fileoverview Shared helper format user cho response.
 * Loại bỏ các trường nhạy cảm (password, refreshToken) trước khi trả về client.
 */

/** Format user cho response — chỉ giữ lại các trường an toàn */
export const formatUser = (user: { id: string; email: string; displayName: string; avatar: string | null }) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
});

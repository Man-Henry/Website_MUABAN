/**
 * @fileoverview Mở rộng Express Request để thêm user property.
 */

import type { TokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

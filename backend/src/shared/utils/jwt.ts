/**
 * @fileoverview JWT utilities — sinh và verify access/refresh tokens.
 */

import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

/** Sinh access token (ngắn hạn) */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/** Sinh refresh token (dài hạn) */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/** Verify access token */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

/** Verify refresh token */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

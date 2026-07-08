/**
 * @fileoverview Custom Error class với HTTP status code.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên.') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Bạn chưa đăng nhập.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này.') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ.') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Dữ liệu bị trùng lặp.') {
    super(message, 409);
  }
}

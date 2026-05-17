import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Centralized error handler middleware.
 * Handles Mongoose validation errors, duplicate key errors, and generic errors.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if ((err as Record<string, unknown>).code === 11000) {
    const keyValue = (err as Record<string, unknown>).keyValue as Record<string, string> | undefined;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errors: [{ field, message: `Duplicate ${field}` }],
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for unmatched routes.
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

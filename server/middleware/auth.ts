import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRoleType } from '../constants';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRoleType;
  };
}

/**
 * Retrieves the JWT_SECRET from environment variables.
 * Throws at startup if not configured (enforced in server/index.ts).
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

/**
 * Authentication middleware — verifies JWT from Authorization header.
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret()) as {
      userId: string;
      email: string;
      role: UserRoleType;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token has expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Role-based access control middleware.
 * Must be placed AFTER authMiddleware in the route chain.
 */
export const roleMiddleware = (allowedRoles: UserRoleType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

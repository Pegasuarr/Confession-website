import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../services/prisma';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-change-in-production-12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-change-in-production-12345';

// Access Token generator
export const generateAccessToken = (payload: { id: string; email: string; role: Role; name: string }): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
  });
};

// Refresh Token generator
export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });
};

// Authentication guard
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
      id: string;
      email: string;
      role: Role;
      name: string;
    };

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, banned: true },
    });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User no longer exists' });
      return;
    }

    if (user.banned) {
      res.status(403).json({ status: 'error', message: 'Your account has been disabled. Please contact support.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ status: 'error', message: 'Token expired', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(403).json({ status: 'error', message: 'Invalid access token' });
  }
};

// Admin route guard
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({ status: 'error', message: 'Admin access required' });
    return;
  }
  next();
};

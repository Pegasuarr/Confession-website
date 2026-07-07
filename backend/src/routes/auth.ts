import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../services/prisma';
import { validateRequest } from '../middleware/validation';
import {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
} from '../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailer';
import passport from 'passport';
import { AuthProvider, Role } from '@prisma/client';

const router = Router();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-change-in-production-12345';

// Zod schemas for input validation
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// Register User
router.post(
  '/register',
  validateRequest(registerSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ status: 'error', message: 'Email already registered' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Check if this is the first registered user; if so, make them an ADMIN
      const usersCount = await prisma.user.count();
      const role = usersCount === 0 ? Role.ADMIN : Role.USER;

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`,
          provider: AuthProvider.LOCAL,
          verified: process.env.NODE_ENV !== 'production',
          verificationToken,
          role,
        },
      });

      // Send verification email asynchronously if in production
      if (process.env.NODE_ENV === 'production') {
        sendVerificationEmail(user.email, user.name, verificationToken);
      }

      res.status(201).json({
        status: 'success',
        message: process.env.NODE_ENV !== 'production'
          ? 'Registration successful! (Auto-verified for local development)'
          : 'Registration successful. Please check your email to verify your account.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify Email
router.post(
  '/verify-email',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ status: 'error', message: 'Verification token is required' });
        return;
      }

      const user = await prisma.user.findFirst({
        where: { verificationToken: token },
      });

      if (!user) {
        res.status(400).json({ status: 'error', message: 'Invalid or expired verification token' });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          verificationToken: null,
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Email successfully verified. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validateRequest(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        return;
      }

      // Check if banned
      if (user.banned) {
        res.status(403).json({
          status: 'error',
          message: 'Your account has been disabled. Please contact support.',
        });
        return;
      }

      // Check verification status
      if (!user.verified) {
        res.status(403).json({
          status: 'error',
          message: 'Please verify your email address before logging in.',
          code: 'EMAIL_UNVERIFIED',
        });
        return;
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const refreshToken = generateRefreshToken({ id: user.id });

      // Store refresh token in secure cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: 'success',
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh Token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ status: 'error', message: 'Refresh token required' });
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        res.status(401).json({ status: 'error', message: 'User not found' });
        return;
      }

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.status(200).json({
        status: 'success',
        token: accessToken,
      });
    } catch (err) {
      res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

// Forgot Password
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      // For security reasons, don't reveal if user exists or not, always return same status
      if (user && user.provider === AuthProvider.LOCAL) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
          where: { id: user.id },
          data: { resetToken, resetTokenExpires },
        });

        sendPasswordResetEmail(user.email, user.name, resetToken);
      }

      res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reset Password
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() },
        },
      });

      if (!user) {
        res.status(400).json({ status: 'error', message: 'Invalid or expired reset token' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Password successfully reset. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// Helper to determine if Google strategy is loaded
const isGoogleConfigured = (): boolean => {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  return !!(id && id !== 'your-google-client-id' && secret);
};

// Helper for cookie setting and redirection
const handleSuccessfulGoogleLogin = (user: any, res: Response) => {
  const refreshToken = generateRefreshToken({ id: user.id });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${accessToken}`);
};

// Passport Google Auth handlers
router.get('/google', (req, res, next) => {
  if (isGoogleConfigured()) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } else {
    console.log('🔄 Simulating mock Google sign-in redirect...');
    res.redirect(`/api/auth/google/callback?mock=true`);
  }
});

router.get(
  '/google/callback',
  (req: any, res: Response, next: NextFunction) => {
    if (isGoogleConfigured()) {
      passport.authenticate('google', { session: false }, (err: any, user: any) => {
        if (err || !user) {
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=GoogleAuthFailed`);
        }
        handleSuccessfulGoogleLogin(user, res);
      })(req, res, next);
    } else if (req.query.mock === 'true') {
      const handleMockLogin = async () => {
        try {
          const email = "mockuser@gmail.com";
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            const count = await prisma.user.count();
            user = await prisma.user.create({
              data: {
                name: "Google Mock User",
                email,
                avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mock-google",
                provider: AuthProvider.GOOGLE,
                verified: true,
                role: count === 0 ? Role.ADMIN : Role.USER,
              },
            });
          }
          handleSuccessfulGoogleLogin(user, res);
        } catch (error) {
          next(error);
        }
      };
      handleMockLogin();
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=GoogleAuthFailed`);
    }
  }
);

// Custom Google Sign-In handler for single page applications using credential tokens directly
router.post('/google-login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, avatar } = req.body;
    if (!email) {
      res.status(400).json({ status: 'error', message: 'Google email is required' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a new user since it's Google Auth and automatic verification
      const usersCount = await prisma.user.count();
      const role = usersCount === 0 ? Role.ADMIN : Role.USER;

      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          avatar,
          provider: AuthProvider.GOOGLE,
          verified: true, // Google accounts are verified
          role,
        },
      });
    } else if (user.provider !== AuthProvider.GOOGLE) {
      // Update provider to GOOGLE if they sign in with Google now
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: AuthProvider.GOOGLE,
          verified: true,
          avatar: avatar || user.avatar,
        },
      });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

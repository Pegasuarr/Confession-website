import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import linkRoutes from './routes/links';
import responseRoutes from './routes/responses';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import prisma from './services/prisma';

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Essential for loading user avatars or assets in development
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Remove trailing slashes from allowed origins
const cleanedOrigins = allowedOrigins.map((url) => url.replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        return callback(null, true);
      }
      
      const cleanedOrigin = origin.replace(/\/$/, '');
      const isAllowed = 
        cleanedOrigins.includes(cleanedOrigin) || 
        cleanedOrigin.endsWith('.vercel.app');
        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Cookie parsing
app.use(cookieParser());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Throttling / Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Apply rate limiting to all API requests
app.use('/api', apiLimiter);

// Passport initialization
app.use(passport.initialize());

// Configure Google Strategy if credentials exist
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientId !== 'your-google-client-id' && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            const usersCount = await prisma.user.count();
            const role = usersCount === 0 ? 'ADMIN' : 'USER';

            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email,
                avatar: profile.photos?.[0]?.value,
                provider: 'GOOGLE',
                verified: true, // Google login automatically verifies email
                role,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.log('⚠️ Passport Google OAuth Strategy not loaded: Client credentials missing in .env');
}

// Passport session serialization (required by library but unused since we use custom JWTs)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/links', responseRoutes); // Public response submissions
app.use('/api/admin', adminRoutes);

// Base health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;

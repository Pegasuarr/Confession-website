import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../services/prisma';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Zod schema for validation
const createLinkSchema = z.object({
  body: z.object({
    title: z.string().max(100).optional(),
    message: z.string().max(500).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    multipleResponses: z.boolean().optional(),
  }),
});

// Generate alphanumeric slug like ABC123XYZ
const generateSlug = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  let unique = false;

  while (!unique) {
    slug = '';
    for (let i = 0; i < 9; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Verify uniqueness
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (!existing) {
      unique = true;
    }
  }

  return slug;
};

// Create a Link (Protected)
router.post(
  '/',
  authenticateToken,
  validateRequest(createLinkSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const { title, message, expiresAt, multipleResponses } = req.body;

      if (expiresAt) {
        const expiryDate = new Date(expiresAt);
        if (expiryDate <= new Date()) {
          res.status(400).json({
            status: 'error',
            message: 'Expiration date must be in the future.',
          });
          return;
        }
      }

      const slug = await generateSlug();

      const newLink = await prisma.link.create({
        data: {
          userId: req.user.id,
          title: title || null,
          message: message || null,
          slug,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          multipleResponses: multipleResponses ?? true,
        },
      });

      res.status(201).json({
        status: 'success',
        link: newLink,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get User's Links (Protected)
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const links = await prisma.link.findMany({
        where: { userId: req.user.id },
        include: {
          responses: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        status: 'success',
        links,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get Link public details by Slug (Public, increments visits)
router.get(
  '/:slug',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;

      const link = await prisma.link.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          message: true,
          slug: true,
          expiresAt: true,
          multipleResponses: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });

      if (!link) {
        res.status(404).json({ status: 'error', message: 'Link not found' });
        return;
      }

      // Check expiration
      if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
        res.status(410).json({ status: 'error', message: 'This link has expired' });
        return;
      }

      // Increment visits asynchronously
      await prisma.link.update({
        where: { id: link.id },
        data: { visits: { increment: 1 } },
      });

      res.status(200).json({
        status: 'success',
        link,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete Link (Protected)
router.delete(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const link = await prisma.link.findUnique({ where: { id } });
      if (!link) {
        res.status(404).json({ status: 'error', message: 'Link not found' });
        return;
      }

      // Ensure user owns link
      if (link.userId !== req.user.id) {
        res.status(403).json({ status: 'error', message: 'Forbidden' });
        return;
      }

      await prisma.link.delete({ where: { id } });

      res.status(200).json({
        status: 'success',
        message: 'Link successfully deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

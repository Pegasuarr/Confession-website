import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../services/prisma';
import { validateRequest } from '../middleware/validation';
import { sendResponseNotificationEmail } from '../services/mailer';
import { Answer } from '@prisma/client';

const router = Router();

const respondSchema = z.object({
  body: z.object({
    answer: z.enum([Answer.YES, Answer.NO]),
  }),
});

// Submit a response to a link by its slug (Public)
router.post(
  '/:slug/respond',
  validateRequest(respondSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { answer } = req.body;

      const link = await prisma.link.findUnique({
        where: { slug },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      if (!link) {
        res.status(404).json({ status: 'error', message: 'Link not found' });
        return;
      }



      // Hash the IP address to protect privacy but still enforce duplicate limits
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex');

      // Check if multiple responses are disabled and if IP already responded
      if (!link.multipleResponses) {
        const existingResponse = await prisma.response.findFirst({
          where: {
            linkId: link.id,
            ipHash,
          },
        });

        if (existingResponse) {
          res.status(403).json({
            status: 'error',
            message: 'You have already responded to this link.',
          });
          return;
        }
      }

      // Record the response
      const response = await prisma.response.create({
        data: {
          linkId: link.id,
          answer,
          ipHash,
        },
      });

      // Send email alert asynchronously
      sendResponseNotificationEmail(
        link.user.email,
        link.user.name,
        link.user.avatar,
        answer,
        link.message,
        slug
      );

      res.status(201).json({
        status: 'success',
        message: 'Thank you! Your response has been recorded.',
        response,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

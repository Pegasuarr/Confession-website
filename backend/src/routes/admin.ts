import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../services/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Secure all admin routes with authentication and admin privilege validation
router.use(authenticateToken);
router.use(requireAdmin);

// GET Admin stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalLinks = await prisma.link.count();
    const totalResponses = await prisma.response.count();
    
    // Total visits across all links
    const visitsAggregate = await prisma.link.aggregate({
      _sum: {
        visits: true,
      },
    });
    const totalVisits = visitsAggregate._sum.visits || 0;

    // Response breakdown
    const yesCount = await prisma.response.count({ where: { answer: 'YES' } });
    const noCount = await prisma.response.count({ where: { answer: 'NO' } });

    res.status(200).json({
      status: 'success',
      stats: {
        totalUsers,
        totalLinks,
        totalResponses,
        totalVisits,
        yesCount,
        noCount,
        yesPercentage: totalResponses > 0 ? Math.round((yesCount / totalResponses) * 100) : 0,
        noPercentage: totalResponses > 0 ? Math.round((noCount / totalResponses) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET list of all users
router.get('/users', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        verified: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: {
          select: {
            links: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      users,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH toggle ban status of a user
router.patch('/users/:id/ban', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Prevent banning yourself
    if (user.id === req.user?.id) {
      res.status(400).json({ status: 'error', message: 'You cannot ban yourself' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { banned: !user.banned },
      select: { id: true, email: true, banned: true },
    });

    res.status(200).json({
      status: 'success',
      message: `User accounts successfully ${updatedUser.banned ? 'disabled' : 'enabled'}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE administrative link deletion
router.delete('/links/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link) {
      res.status(404).json({ status: 'error', message: 'Link not found' });
      return;
    }

    await prisma.link.delete({ where: { id } });

    res.status(200).json({
      status: 'success',
      message: 'Link successfully deleted by Administrator',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

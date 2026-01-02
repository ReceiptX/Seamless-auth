import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get business configuration
router.get('/config', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.businessId },
      select: {
        id: true,
        email: true,
        publicKey: true,
        allowedOrigins: true,
        callbackUrl: true,
      },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business configuration
router.put('/config', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { allowedOrigins, callbackUrl } = req.body;

    const business = await prisma.business.update({
      where: { id: req.businessId },
      data: {
        allowedOrigins: allowedOrigins || [],
        callbackUrl: callbackUrl || null,
      },
      select: {
        id: true,
        email: true,
        publicKey: true,
        allowedOrigins: true,
        callbackUrl: true,
      },
    });

    res.json(business);
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

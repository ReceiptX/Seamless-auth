import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { generateOTP, generateJWT } from '../utils/auth';
import { sendOTPEmail } from '../services/email';

const router = Router();

// Send OTP
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { email, publicKey } = req.body;

    if (!email || !publicKey) {
      return res.status(400).json({ error: 'Email and publicKey are required' });
    }

    // Find business by public key
    const business = await prisma.business.findUnique({
      where: { publicKey }
    });

    if (!business) {
      return res.status(404).json({ error: 'Invalid public key' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        businessId: business.id,
        expiresAt,
      },
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { email, code, publicKey } = req.body;

    if (!email || !code || !publicKey) {
      return res.status(400).json({ error: 'Email, code, and publicKey are required' });
    }

    // Find business by public key
    const business = await prisma.business.findUnique({
      where: { publicKey }
    });

    if (!business) {
      return res.status(404).json({ error: 'Invalid public key' });
    }

    // Find OTP
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        businessId: business.id,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        email,
        businessId: business.id,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          businessId: business.id,
        },
      });
    }

    // Generate JWT for the user
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      businessId: business.id,
    }, '30d');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

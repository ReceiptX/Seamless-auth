import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateJWT, generatePublicKey, generateSecretKey } from '../utils/auth';

const router = Router();

// Business Signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email }
    });

    if (existingBusiness) {
      return res.status(400).json({ error: 'Business already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate keys
    const publicKey = generatePublicKey();
    const secretKey = generateSecretKey();

    // Create business
    const business = await prisma.business.create({
      data: {
        email,
        password: hashedPassword,
        publicKey,
        secretKey,
      },
    });

    // Generate JWT
    const token = generateJWT({ businessId: business.id });

    res.status(201).json({
      token,
      business: {
        id: business.id,
        email: business.email,
        publicKey: business.publicKey,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Business Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find business
    const business = await prisma.business.findUnique({
      where: { email }
    });

    if (!business) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, business.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateJWT({ businessId: business.id });

    res.json({
      token,
      business: {
        id: business.id,
        email: business.email,
        publicKey: business.publicKey,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateJWT = (payload: object, expiresIn = '7d'): string => {
  // @ts-ignore - expiresIn string format is valid per jwt.sign documentation
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generatePublicKey = (): string => {
  return `pk_${nanoid(32)}`;
};

export const generateSecretKey = (): string => {
  return `sk_${nanoid(48)}`;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

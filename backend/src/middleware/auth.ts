import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';

export interface AuthRequest extends Request {
  businessId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.businessId = decoded.businessId;
  next();
};

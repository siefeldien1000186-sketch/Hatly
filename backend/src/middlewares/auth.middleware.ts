import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../prisma';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  role: 'CUSTOMER' | 'DRIVER' | 'STORE_OWNER' | 'ADMIN';
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication token missing or invalid' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string; phone: string; name: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, phone: true, role: true, name: true, isBlocked: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({ success: false, message: 'Account is suspended. Please contact Hatly support.' });
      return;
    }

    req.user = user as AuthenticatedUser;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' lacks permissions for this resource`,
      });
      return;
    }

    next();
  };
};

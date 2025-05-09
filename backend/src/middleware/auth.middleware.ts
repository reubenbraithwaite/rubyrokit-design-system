// /backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware to protect routes
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};

/**
 * Institution access middleware
 * Ensures user belongs to the specified institution
 */
export const checkInstitutionAccess = (req: Request, res: Response, next: NextFunction) => {
  const { institutionId } = req.params;
  
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Admin can access any institution
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user belongs to the institution
  if (req.user.institutionId !== institutionId) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
};

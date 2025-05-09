// /backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/auth.service';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Register validation rules
   */
  static registerValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ];

  /**
   * Login validation rules
   */
  static loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ];

  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Register user
      const user = await authService.register(req.body);
      
      // Return success
      return res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      
      if (error.message === 'User already exists') {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      return res.status(500).json({ message: 'Error registering user' });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Login user
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      
      // Return success with user and token
      return res.status(200).json({
        message: 'Login successful',
        user,
        token
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      return res.status(500).json({ message: 'Error logging in' });
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await authService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      logger.error('Get current user error:', error);
      return res.status(500).json({ message: 'Error getting user profile' });
    }
  }
  
  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      return res.status(500).json({ message: 'Error updating profile' });
    }
  }
  
  /**
   * Change password validation rules
   */
  static changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ];
  
  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { currentPassword, newPassword } = req.body;
      const success = await authService.changePassword(req.user.id, currentPassword, newPassword);
      
      return res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      logger.error('Change password error:', error);
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      return res.status(500).json({ message: 'Error changing password' });
    }
  }
}

export default AuthController;

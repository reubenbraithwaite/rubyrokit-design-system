// /backend/src/controllers/design.controller.ts
import { Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import designService from '../services/design.service';
import logger from '../utils/logger';

export class DesignController {
  /**
   * Create design validation rules
   */
  static createDesignValidation = [
    body('name').optional().isString().trim().notEmpty().withMessage('Design name must not be empty if provided')
  ];

  /**
   * Update design validation rules
   */
  static updateDesignValidation = [
    param('id').isMongoId().withMessage('Invalid design ID'),
    body('name').optional().isString().trim().notEmpty().withMessage('Design name must not be empty if provided'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean if provided'),
    body('globalSettings').optional().isObject().withMessage('Global settings must be an object if provided'),
    body('sections').optional().isArray().withMessage('Sections must be an array if provided'),
    body('components').optional().isArray().withMessage('Components must be an array if provided'),
    body('sectionConnections').optional().isArray().withMessage('Section connections must be an array if provided'),
    body('finDesigns').optional().isArray().withMessage('Fin designs must be an array if provided'),
    body('templateSettings').optional().isObject().withMessage('Template settings must be an object if provided'),
    body('changeDescription').optional().isString().withMessage('Change description must be a string if provided')
  ];

  /**
   * Get designs pagination validation rules
   */
  static getDesignsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isString().withMessage('Sort by must be a string'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ];

  /**
   * Create a new design
   */
  static async createDesign(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Create design
      const design = await designService.createDesign(req.user.id, req.body);
      
      // Return success
      return res.status(201).json({
        message: 'Design created successfully',
        design
      });
    } catch (error: any) {
      logger.error('Design creation error:', error);
      return res.status(500).json({ message: 'Error creating design' });
    }
  }

  /**
   * Get all designs for the current user
   */
  static async getUserDesigns(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'updatedAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      
      // Get designs
      const result = await designService.getUserDesigns(req.user.id, page, limit, sortBy, sortOrder);
      
      // Return success
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get user designs error:', error);
      return res.status(500).json({ message: 'Error retrieving designs' });
    }
  }

  /**
   * Get public designs
   */
  static async getPublicDesigns(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'updatedAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      
      // Get designs
      const result = await designService.getPublicDesigns(page, limit, sortBy, sortOrder);
      
      // Return success
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get public designs error:', error);
      return res.status(500).json({ message: 'Error retrieving public designs' });
    }
  }

  /**
   * Get a design by ID
   */
  static async getDesignById(req: Request, res: Response) {
    try {
      // Validate design ID
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      // Get design
      const design = await designService.getDesignById(req.params.id, req.user.id);
      
      // Check if design exists
      if (!design) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Return success
      return res.status(200).json({ design });
    } catch (error: any) {
      logger.error('Get design by ID error:', error);
      
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      return res.status(500).json({ message: 'Error retrieving design' });
    }
  }

  /**
   * Update a design
   */
  static async updateDesign(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract change description if provided
      const { changeDescription, ...updateData } = req.body;
      
      // Update design
      const design = await designService.updateDesign(
        req.params.id, 
        req.user.id, 
        updateData, 
        changeDescription || 'Design update'
      );
      
      // Check if design exists
      if (!design) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Return success
      return res.status(200).json({
        message: 'Design updated successfully',
        design
      });
    } catch (error: any) {
      logger.error('Update design error:', error);
      
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      return res.status(500).json({ message: 'Error updating design' });
    }
  }

  /**
   * Delete a design
   */
  static async deleteDesign(req: Request, res: Response) {
    try {
      // Validate design ID
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      // Delete design
      const success = await designService.deleteDesign(req.params.id, req.user.id);
      
      // Check if design was found and deleted
      if (!success) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Return success
      return res.status(200).json({
        message: 'Design deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete design error:', error);
      
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      return res.status(500).json({ message: 'Error deleting design' });
    }
  }

  /**
   * Clone a design
   */
  static async cloneDesign(req: Request, res: Response) {
    try {
      // Validate design ID
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      // Clone design
      const design = await designService.cloneDesign(
        req.params.id, 
        req.user.id,
        req.body.name
      );
      
      // Check if design exists
      if (!design) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Return success
      return res.status(201).json({
        message: 'Design cloned successfully',
        design
      });
    } catch (error: any) {
      logger.error('Clone design error:', error);
      return res.status(500).json({ message: 'Error cloning design' });
    }
  }

  /**
   * Toggle a design's public/private status
   */
  static async togglePublicStatus(req: Request, res: Response) {
    try {
      // Validate design ID
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      // Toggle public status
      const design = await designService.togglePublicStatus(req.params.id, req.user.id);
      
      // Check if design exists
      if (!design) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Return success
      return res.status(200).json({
        message: `Design is now ${design.isPublic ? 'public' : 'private'}`,
        design
      });
    } catch (error: any) {
      logger.error('Toggle design public status error:', error);
      
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      return res.status(500).json({ message: 'Error updating design public status' });
    }
  }
}

export default DesignController;

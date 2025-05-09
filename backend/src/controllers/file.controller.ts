// /backend/src/controllers/file.controller.ts
import { Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import fileService from '../services/file.service';
import designService from '../services/design.service';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class FileController {
  /**
   * Generate template validation rules
   */
  static generateTemplateValidation = [
    param('id').isMongoId().withMessage('Invalid design ID'),
    query('format').optional().isIn(['svg', 'pdf', 'silhouette', 'cricut']).withMessage('Invalid format')
  ];

  /**
   * Generate template for a design
   */
  static async generateTemplate(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get design ID and format
      const designId = req.params.id;
      const format = (req.query.format as string || 'svg').toLowerCase();
      
      // Get design
      const design = await designService.getDesignById(designId, req.user.id);
      
      // Check if design exists
      if (!design) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Generate SVG template
      const svgContent = await fileService.generateSvgTemplate(design);
      
      // Handle different formats
      switch (format) {
        case 'svg':
          // Send SVG directly
          res.set('Content-Type', 'image/svg+xml');
          res.set('Content-Disposition', `attachment; filename="${design.name}.svg"`);
          return res.send(svgContent);
          
        case 'pdf':
          // Generate PDF and send
          const pdfBuffer = await fileService.generatePdfTemplate(svgContent);
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', `attachment; filename="${design.name}.pdf"`);
          return res.send(pdfBuffer);
          
        case 'silhouette':
          // Generate Silhouette Studio file and send
          const silhouetteBuffer = await fileService.generateSilhouetteStudioFile(svgContent);
          res.set('Content-Type', 'application/octet-stream');
          res.set('Content-Disposition', `attachment; filename="${design.name}.studio"`);
          return res.send(silhouetteBuffer);
          
        case 'cricut':
          // Generate Cricut file and send
          const cricutBuffer = await fileService.generateCricutFile(svgContent);
          res.set('Content-Type', 'application/octet-stream');
          res.set('Content-Disposition', `attachment; filename="${design.name}.zip"`);
          return res.send(cricutBuffer);
          
        default:
          return res.status(400).json({ message: 'Unsupported format' });
      }
    } catch (error: any) {
      logger.error('Generate template error:', error);
      return res.status(500).json({ message: 'Error generating template' });
    }
  }

  /**
   * Save template for a design
   */
  static async saveTemplate(req: Request, res: Response) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get design ID
      const designId = req.params.id;
      
      // Get design
      const design = await designService.getDesignById(designId, req.user.id);
      
      // Check if design exists
      if (!design) {
        return res.status(404).json({ message: 'Design not found or access denied' });
      }
      
      // Generate and save template
      const templateUrl = await fileService.generateAndSaveTemplate(designId, design);
      
      // Return success
      return res.status(200).json({
        message: 'Template generated and saved successfully',
        templateUrl
      });
    } catch (error: any) {
      logger.error('Save template error:', error);
      return res.status(500).json({ message: 'Error saving template' });
    }
  }
  
  /**
   * Download a locally saved template
   */
  static async downloadTemplate(req: Request, res: Response) {
    try {
      // Get filepath and check if it exists
      const filepath = req.params.filepath;
      
      // Security check to prevent directory traversal
      const filename = path.basename(filepath);
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: 'Template file not found' });
      }
      
      // Set headers
      res.set('Content-Type', 'image/svg+xml');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Stream file to response
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);
    } catch (error: any) {
      logger.error('Download template error:', error);
      return res.status(500).json({ message: 'Error downloading template' });
    }
  }
}

export default FileController;

// /backend/src/services/file.service.ts
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { IDesign } from '../models/Design';
import config from '../config';
import logger from '../utils/logger';

// Initialize S3 client if AWS credentials are provided
const s3 = config.aws.accessKeyId && config.aws.secretAccessKey
  ? new S3({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  })
  : null;

export class FileService {
  /**
   * Generate SVG template for a design
   * This is a placeholder implementation that will be expanded in Phase 3
   */
  async generateSvgTemplate(design: IDesign): Promise<string> {
    try {
      // This is a minimal SVG generation implementation
      // In the full implementation, this would generate a complex SVG based on the design data
      
      // For now, we'll generate a simple SVG with basic rocket shape
      const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <title>${design.name} - Template</title>
  <defs>
    <style>
      .section-nosecone { fill: #f9d5e5; stroke: #000; stroke-width: 1; }
      .section-payload { fill: #eeeeee; stroke: #000; stroke-width: 1; }
      .section-main { fill: #d5f9e5; stroke: #000; stroke-width: 1; }
      .fin { fill: #e5d5f9; stroke: #000; stroke-width: 1; }
      .text { font-family: Arial; font-size: 12px; }
    </style>
  </defs>
  <g id="rocket">
    <!-- Nosecone -->
    <path d="M 400,100 L 350,200 L 450,200 Z" class="section-nosecone" />
    
    <!-- Payload bay -->
    <rect x="350" y="200" width="100" height="100" class="section-payload" />
    
    <!-- Main body -->
    <rect x="350" y="300" width="100" height="200" class="section-main" />
    
    <!-- Fins -->
    <path d="M 350,450 L 300,500 L 350,500 Z" class="fin" />
    <path d="M 450,450 L 500,500 L 450,500 Z" class="fin" />
    
    <!-- Labels -->
    <text x="400" y="150" text-anchor="middle" class="text">Nosecone</text>
    <text x="400" y="250" text-anchor="middle" class="text">Payload Bay</text>
    <text x="400" y="400" text-anchor="middle" class="text">Main Body</text>
  </g>
</svg>`;
      
      return svgContent;
    } catch (error) {
      logger.error('Error generating SVG template:', error);
      throw new Error('Failed to generate SVG template');
    }
  }
  
  /**
   * Save SVG content to a temporary file
   */
  async saveSvgToTemp(svgContent: string, filename: string = 'template.svg'): Promise<string> {
    try {
      // Create a temporary file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `${uuidv4()}_${filename}`);
      
      // Write SVG content to file
      await fs.promises.writeFile(tempFilePath, svgContent, 'utf-8');
      
      return tempFilePath;
    } catch (error) {
      logger.error('Error saving SVG to temp file:', error);
      throw new Error('Failed to save SVG to temporary file');
    }
  }
  
  /**
   * Upload a file to S3
   */
  async uploadFileToS3(filePath: string, key: string): Promise<string | null> {
    try {
      // Check if S3 is configured
      if (!s3 || !config.aws.s3Bucket) {
        logger.warn('S3 not configured, skipping upload');
        return null;
      }
      
      // Read file content
      const fileContent = await fs.promises.readFile(filePath);
      
      // Define upload parameters
      const params = {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: fileContent,
        ContentType: this.getContentType(filePath),
        ACL: 'private'
      };
      
      // Upload to S3
      const data = await s3.upload(params).promise();
      
      // Clean up temp file
      await fs.promises.unlink(filePath);
      
      return data.Location;
    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }
  
  /**
   * Get the content type of a file
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.svg':
        return 'image/svg+xml';
      case '.pdf':
        return 'application/pdf';
      case '.studio':
        return 'application/octet-stream';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }
  
  /**
   * Generate and save SVG template for a design
   */
  async generateAndSaveTemplate(designId: string, design: IDesign): Promise<string> {
    try {
      // Generate SVG template
      const svgContent = await this.generateSvgTemplate(design);
      
      // Save to temp file
      const tempFilePath = await this.saveSvgToTemp(svgContent, `${designId}.svg`);
      
      // Define S3 key
      const s3Key = `templates/${designId}/${uuidv4()}.svg`;
      
      // Upload to S3 if configured
      if (s3 && config.aws.s3Bucket) {
        const s3Url = await this.uploadFileToS3(tempFilePath, s3Key);
        
        // Clean up temp file
        await fs.promises.unlink(tempFilePath);
        
        return s3Url || tempFilePath;
      }
      
      // Return local file path if S3 not configured
      return tempFilePath;
    } catch (error) {
      logger.error('Error generating and saving template:', error);
      throw new Error('Failed to generate and save template');
    }
  }
  
  /**
   * Generate Silhouette Studio file from SVG
   * This is a placeholder implementation
   */
  async generateSilhouetteStudioFile(svgContent: string): Promise<Buffer> {
    try {
      // This is a placeholder - in reality, converting to Silhouette Studio format
      // would require a more complex implementation or integration with their SDK
      
      // For now, we'll just create a mock file with a header and the SVG content
      const header = Buffer.from('SILHOUETTE-STUDIO-FILE\n', 'utf-8');
      const content = Buffer.from(svgContent, 'utf-8');
      
      return Buffer.concat([header, content]);
    } catch (error) {
      logger.error('Error generating Silhouette Studio file:', error);
      throw new Error('Failed to generate Silhouette Studio file');
    }
  }
  
  /**
   * Generate Cricut Design Space file from SVG
   * This is a placeholder implementation
   */
  async generateCricutFile(svgContent: string): Promise<Buffer> {
    try {
      // This is a placeholder - in reality, converting to Cricut format
      // would require a more complex implementation or integration with their SDK
      
      // For now, we'll just create a mock file with a header and the SVG content
      const header = Buffer.from('CRICUT-DESIGN-SPACE-FILE\n', 'utf-8');
      const content = Buffer.from(svgContent, 'utf-8');
      
      return Buffer.concat([header, content]);
    } catch (error) {
      logger.error('Error generating Cricut file:', error);
      throw new Error('Failed to generate Cricut file');
    }
  }
  
  /**
   * Generate PDF template from SVG
   * This is a placeholder implementation
   */
  async generatePdfTemplate(svgContent: string): Promise<Buffer> {
    try {
      // This is a placeholder - in reality, converting SVG to PDF
      // would require a library like PDFKit or puppeteer
      
      // For now, we'll just create a mock PDF with a header and the SVG content
      const header = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'utf-8');
      const content = Buffer.from(svgContent, 'utf-8');
      const footer = Buffer.from('\nendobj\n%%EOF', 'utf-8');
      
      return Buffer.concat([header, content, footer]);
    } catch (error) {
      logger.error('Error generating PDF template:', error);
      throw new Error('Failed to generate PDF template');
    }
  }
}

export default new FileService();

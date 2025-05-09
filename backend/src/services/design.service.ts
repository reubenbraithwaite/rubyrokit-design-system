// /backend/src/services/design.service.ts
import { Design, IDesign } from '../models/Design';
import mongoose from 'mongoose';
import logger from '../utils/logger';

export class DesignService {
  /**
   * Create a new design
   */
  async createDesign(userId: string, designData: Partial<IDesign> = {}): Promise<IDesign> {
    try {
      // Create basic design template with defaults
      const newDesign = new Design({
        name: designData.name || 'Untitled Design',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: designData.isPublic || false,
        
        // Initialize with default settings
        globalSettings: designData.globalSettings || {
          defaultCuttingMethod: 'digital',
          defaultMaterial: 'cardstock',
          scale: 1.0
        },
        
        // Initialize with default sections (nosecone, payload bay, main body)
        sections: designData.sections || [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'nosecone',
            name: 'Nosecone',
            boundaries: {
              start: 0,
              end: 0.2
            },
            noseconeStructure: {
              supportType: 'conical',
              reinforcementRings: 2,
              tipConstruction: 'rounded',
              bulkhead: {
                design: {},
                reinforced: true
              }
            },
            noseconeShell: {
              constructionType: 'gores',
              segmentCount: 4,
              attachmentMethod: 'tab_slot',
              design: {}
            }
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'payload_bay',
            name: 'Payload Bay',
            boundaries: {
              start: 0.2,
              end: 0.5
            },
            finConfiguration: {
              mainFinCount: 4,
              upperFinCount: 0
            },
            sparTemplates: {
              typeA: {
                count: 4,
                design: {}
              },
              typeB: {
                count: 0,
                design: {}
              }
            },
            shroudPanels: {
              count: 4,
              doubled: false,
              panels: []
            },
            sparPositions: []
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'main_body',
            name: 'Main Body',
            boundaries: {
              start: 0.5,
              end: 1.0
            },
            finConfiguration: {
              mainFinCount: 4,
              upperFinCount: 0
            },
            sparTemplates: {
              typeA: {
                count: 4,
                design: {}
              },
              typeB: {
                count: 0,
                design: {}
              }
            },
            shroudPanels: {
              count: 4,
              doubled: false,
              panels: []
            },
            sparPositions: []
          }
        ],
        
        // Initialize empty components, fins, etc.
        components: designData.components || [],
        sectionConnections: designData.sectionConnections || [],
        finDesigns: designData.finDesigns || [],
        
        // Initialize performance metrics
        performanceMetrics: designData.performanceMetrics || {
          weight: 0,
          stability: 0,
          dragCoefficient: 0,
          estimatedHeight: 0,
          centerOfGravity: { x: 0, y: 0, z: 0 },
          centerOfPressure: { x: 0, y: 0, z: 0 }
        },
        
        // Initialize template settings
        templateSettings: designData.templateSettings || {
          paperSize: 'letter',
          orientation: 'portrait',
          units: 'mm',
          includeInstructions: true,
          includeRegistrationMarks: true
        },
        
        // Initialize version control
        version: 1,
        history: [
          {
            version: 1,
            timestamp: new Date(),
            changes: 'Initial design creation'
          }
        ]
      });
      
      // Save design
      await newDesign.save();
      return newDesign;
    } catch (error) {
      logger.error('Error creating design:', error);
      throw error;
    }
  }
  
  /**
   * Get all designs for a user
   */
  async getUserDesigns(
    userId: string, 
    page: number = 1, 
    limit: number = 10, 
    sortBy: string = 'updatedAt', 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ 
    designs: IDesign[], 
    total: number, 
    page: number, 
    pages: number 
  }> {
    try {
      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      
      // Count total designs for pagination
      const total = await Design.countDocuments({ createdBy: userId });
      
      // Calculate total pages
      const pages = Math.ceil(total / limit);
      
      // Get designs with pagination
      const designs = await Design.find({ createdBy: userId })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit);
      
      return {
        designs,
        total,
        page,
        pages
      };
    } catch (error) {
      logger.error('Error getting user designs:', error);
      throw error;
    }
  }
  
  /**
   * Get designs shared with the public
   */
  async getPublicDesigns(
    page: number = 1, 
    limit: number = 10, 
    sortBy: string = 'updatedAt', 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ 
    designs: IDesign[], 
    total: number, 
    page: number, 
    pages: number 
  }> {
    try {
      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      
      // Count total public designs for pagination
      const total = await Design.countDocuments({ isPublic: true });
      
      // Calculate total pages
      const pages = Math.ceil(total / limit);
      
      // Get public designs with pagination
      const designs = await Design.find({ isPublic: true })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit);
      
      return {
        designs,
        total,
        page,
        pages
      };
    } catch (error) {
      logger.error('Error getting public designs:', error);
      throw error;
    }
  }
  
  /**
   * Get a design by ID
   * If userId is provided, checks if the user has access to the design
   */
  async getDesignById(designId: string, userId?: string): Promise<IDesign | null> {
    try {
      const design = await Design.findById(designId);
      
      // If design not found
      if (!design) {
        return null;
      }
      
      // Check if user has access to the design
      if (userId && design.createdBy.toString() !== userId && !design.isPublic) {
        throw new Error('Access denied');
      }
      
      return design;
    } catch (error) {
      logger.error('Error getting design by ID:', error);
      throw error;
    }
  }
  
  /**
   * Update a design
   * Creates a new version in the design history
   */
  async updateDesign(
    designId: string, 
    userId: string, 
    updateData: Partial<IDesign>, 
    changeDescription: string = 'Design update'
  ): Promise<IDesign | null> {
    try {
      // Get the design
      const design = await this.getDesignById(designId, userId);
      
      // If design not found or user doesn't have access
      if (!design) {
        return null;
      }
      
      // Check if user has permission to update
      if (design.createdBy.toString() !== userId) {
        throw new Error('Access denied');
      }
      
      // Prevent updating critical fields
      delete updateData.createdBy;
      delete updateData.createdAt;
      delete updateData.version;
      delete updateData.history;
      
      // Increment version
      const newVersion = design.version + 1;
      
      // Update the design
      const updatedDesign = await Design.findByIdAndUpdate(
        designId,
        {
          ...updateData,
          updatedAt: new Date(),
          version: newVersion,
          $push: {
            history: {
              version: newVersion,
              timestamp: new Date(),
              changes: changeDescription
            }
          }
        },
        { new: true }
      );
      
      return updatedDesign;
    } catch (error) {
      logger.error('Error updating design:', error);
      throw error;
    }
  }
  
  /**
   * Delete a design
   */
  async deleteDesign(designId: string, userId: string): Promise<boolean> {
    try {
      // Get the design
      const design = await this.getDesignById(designId, userId);
      
      // If design not found or user doesn't have access
      if (!design) {
        return false;
      }
      
      // Check if user has permission to delete
      if (design.createdBy.toString() !== userId) {
        throw new Error('Access denied');
      }
      
      // Delete the design
      await Design.findByIdAndDelete(designId);
      
      return true;
    } catch (error) {
      logger.error('Error deleting design:', error);
      throw error;
    }
  }
  
  /**
   * Clone a design
   * Creates a copy of an existing design with a new ID
   */
  async cloneDesign(
    designId: string, 
    userId: string, 
    newName?: string
  ): Promise<IDesign | null> {
    try {
      // Get the design
      const design = await this.getDesignById(designId, userId);
      
      // If design not found or user doesn't have access
      if (!design) {
        return null;
      }
      
      // Create a new design based on the existing one
      const designObject = design.toObject();
      
      // Remove fields that should be unique
      delete designObject._id;
      delete designObject.id;
      
      // Update metadata
      designObject.name = newName || `Copy of ${design.name}`;
      designObject.createdBy = userId;
      designObject.createdAt = new Date();
      designObject.updatedAt = new Date();
      designObject.isPublic = false;
      designObject.version = 1;
      designObject.history = [
        {
          version: 1,
          timestamp: new Date(),
          changes: `Cloned from design ${designId}`
        }
      ];
      
      // Create and return the cloned design
      const newDesign = await this.createDesign(userId, designObject);
      return newDesign;
    } catch (error) {
      logger.error('Error cloning design:', error);
      throw error;
    }
  }
  
  /**
   * Toggle a design's public/private status
   */
  async togglePublicStatus(designId: string, userId: string): Promise<IDesign | null> {
    try {
      // Get the design
      const design = await this.getDesignById(designId, userId);
      
      // If design not found or user doesn't have access
      if (!design) {
        return null;
      }
      
      // Check if user has permission to update
      if (design.createdBy.toString() !== userId) {
        throw new Error('Access denied');
      }
      
      // Toggle public status
      const newStatus = !design.isPublic;
      
      // Update the design
      const updatedDesign = await Design.findByIdAndUpdate(
        designId,
        {
          isPublic: newStatus,
          updatedAt: new Date(),
          $push: {
            history: {
              version: design.version,
              timestamp: new Date(),
              changes: newStatus ? 'Made design public' : 'Made design private'
            }
          }
        },
        { new: true }
      );
      
      return updatedDesign;
    } catch (error) {
      logger.error('Error toggling design public status:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific version of a design from history
   */
  async getDesignVersion(designId: string, userId: string, version: number): Promise<IDesign | null> {
    try {
      // Get the current design
      const design = await this.getDesignById(designId, userId);
      
      // If design not found or user doesn't have access
      if (!design) {
        return null;
      }
      
      // Check if requested version exists
      const versionExists = design.history.some(h => h.version === version);
      if (!versionExists) {
        throw new Error('Version not found');
      }
      
      // For now, we don't store the full design state for each version
      // This would require additional implementation to store and retrieve versions
      // Return the current design with a note that version retrieval isn't fully implemented
      
      // In a real implementation, we could:
      // 1. Store full design snapshots for each version
      // 2. Store diffs and reconstruct versions on demand
      // 3. Use a version control system or database with versioning support
      
      throw new Error('Retrieving specific design versions is not implemented yet');
    } catch (error) {
      logger.error('Error getting design version:', error);
      throw error;
    }
  }
}

export default new DesignService();

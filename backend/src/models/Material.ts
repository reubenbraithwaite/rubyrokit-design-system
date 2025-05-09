import mongoose, { Document, Schema } from 'mongoose';
import { CuttingMethod, ComponentType } from '../types/models';

export interface IMaterialProperties {
  thickness: number;
  density: number;
  flexibility: number;
  tensileStrength: number;
  cost: number;
}

export interface IMaterialConstraints {
  minimumBendRadius: number;
  maximumLength: number;
  cuttingMethodCompatibility: CuttingMethod[];
}

export interface IMaterial extends Document {
  name: string;
  category: string;
  properties: IMaterialProperties;
  constraints: IMaterialConstraints;
  componentCompatibility: ComponentType[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialPropertiesSchema = new Schema<IMaterialProperties>({
  thickness: {
    type: Number,
    required: true,
    min: 0
  },
  density: {
    type: Number,
    required: true,
    min: 0
  },
  flexibility: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  tensileStrength: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const MaterialConstraintsSchema = new Schema<IMaterialConstraints>({
  minimumBendRadius: {
    type: Number,
    required: true,
    min: 0
  },
  maximumLength: {
    type: Number,
    required: true,
    min: 0
  },
  cuttingMethodCompatibility: [{
    type: String,
    enum: Object.values(CuttingMethod),
    required: true
  }]
}, { _id: false });

const MaterialSchema = new Schema<IMaterial>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  properties: {
    type: MaterialPropertiesSchema,
    required: true
  },
  constraints: {
    type: MaterialConstraintsSchema,
    required: true
  },
  componentCompatibility: [{
    type: String,
    enum: Object.values(ComponentType),
    required: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  thumbnailUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Create composite index for faster querying
MaterialSchema.index({ isPublic: 1, createdBy: 1 });

export default mongoose.model<IMaterial>('Material', MaterialSchema);

import mongoose, { Document, Schema } from 'mongoose';

// Define enum for product types
export enum ProductType {
  KIT = 'kit',
  DESIGN = 'design',
  MATERIAL = 'material',
  TOOL = 'tool',
}

// Define interface for product components
export interface IProductComponent {
  material: string;
  quantity: number;
}

// Define interface for product dimensions
export interface IProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

// Define interface for product review
export interface IProductReview {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  date: Date;
}

// Define main Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  type: ProductType;
  associatedDesign?: mongoose.Types.ObjectId;
  price: number;
  discountPrice?: number;
  inventory: number;
  components?: IProductComponent[];
  images?: string[];
  customizationOptions?: any;
  shippingWeight?: number;
  dimensions?: IProductDimensions;
  reviews?: IProductReview[];
  featured?: boolean;
  tags?: string[];
  sku: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

// Define schemas for nested objects
const ProductComponentSchema = new Schema<IProductComponent>({
  material: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const ProductDimensionsSchema = new Schema<IProductDimensions>({
  length: {
    type: Number,
    required: true,
    min: 0
  },
  width: {
    type: Number,
    required: true,
    min: 0
  },
  height: {
    type: Number,
    required: true, 
    min: 0
  },
  unit: {
    type: String,
    default: 'cm',
    enum: ['mm', 'cm', 'in']
  }
}, { _id: false });

const ProductReviewSchema = new Schema<IProductReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Define main Product schema
const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ProductType),
    required: true
  },
  associatedDesign: {
    type: Schema.Types.ObjectId,
    ref: 'Design'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  components: [ProductComponentSchema],
  images: [{
    type: String
  }],
  customizationOptions: {
    type: Schema.Types.Mixed
  },
  shippingWeight: {
    type: Number,
    min: 0
  },
  dimensions: ProductDimensionsSchema,
  reviews: [ProductReviewSchema],
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create indexes for common queries
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ type: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ status: 1 });

// Virtual for average rating calculation
ProductSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) {
    return 0;
  }
  
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return sum / this.reviews.length;
});

// Virtual for review count
ProductSchema.virtual('reviewCount').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual for effective price (accounts for discount)
ProductSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice && this.discountPrice < this.price 
    ? this.discountPrice 
    : this.price;
});

export default mongoose.model<IProduct>('Product', ProductSchema);

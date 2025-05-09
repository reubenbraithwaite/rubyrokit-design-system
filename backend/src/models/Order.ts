import mongoose, { Document, Schema } from 'mongoose';
import { IAddress } from './Institution';

// Define enum for order status
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Define enum for payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// Define interface for order items
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  customizations?: any;
  name: string;
  sku: string;
}

// Define interface for shipping info
export interface IShippingInfo {
  method: string;
  carrier: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  cost: number;
}

// Define interface for payment info
export interface IPaymentInfo {
  method: string;
  transactionId?: string;
  status: PaymentStatus;
  date: Date;
}

// Define main Order interface
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  date: Date;
  status: OrderStatus;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  paymentInfo: IPaymentInfo;
  shippingAddress: IAddress;
  billingAddress: IAddress;
  shippingInfo?: IShippingInfo;
  notes?: string;
  institutionId?: mongoose.Types.ObjectId;  // For institutional purchases
  createdAt: Date;
  updatedAt: Date;
}

// Define schemas for nested objects
// We'll reuse the AddressSchema from Institution model for shipping and billing addresses

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  customizations: {
    type: Schema.Types.Mixed
  },
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  }
}, { _id: false });

const ShippingInfoSchema = new Schema<IShippingInfo>({
  method: {
    type: String,
    required: true
  },
  carrier: {
    type: String,
    required: true
  },
  trackingNumber: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const PaymentInfoSchema = new Schema<IPaymentInfo>({
  method: {
    type: String,
    required: true,
    enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'other']
  },
  transactionId: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    required: true,
    default: PaymentStatus.PENDING
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Import the Address schema
const AddressSchema = new Schema<IAddress>({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String, 
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'US'
  }
}, { _id: false });

// Define main Order schema
const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: [
      (val: IOrderItem[]) => val.length > 0,
      'Order must have at least one item'
    ]
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentInfo: {
    type: PaymentInfoSchema,
    required: true
  },
  shippingAddress: {
    type: AddressSchema,
    required: true
  },
  billingAddress: {
    type: AddressSchema,
    required: true
  },
  shippingInfo: {
    type: ShippingInfoSchema
  },
  notes: {
    type: String
  },
  institutionId: {
    type: Schema.Types.ObjectId,
    ref: 'Institution'
  }
}, {
  timestamps: true
});

// Create indexes for common queries
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ date: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'paymentInfo.status': 1 });
OrderSchema.index({ institutionId: 1 });

// Create compound indexes for advanced queries
OrderSchema.index({ userId: 1, date: -1 });
OrderSchema.index({ status: 1, date: -1 });

// Virtual for item count
OrderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save hook to generate a unique order number if not provided
OrderSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  if (!this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    this.orderNumber = `ORD-${dateStr}-${randomSuffix}`;
  }
  
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);

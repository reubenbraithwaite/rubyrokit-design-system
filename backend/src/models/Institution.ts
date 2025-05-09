import mongoose, { Document, Schema } from 'mongoose';

// Define enum for institution types
export enum InstitutionType {
  SCHOOL = 'school',
  MAKERSPACE = 'makerspace',
  COMMUNITY_CENTER = 'community_center',
  OTHER = 'other',
}

// Define interface for institution address
export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Define interface for contact person
export interface IContactPerson {
  name: string;
  email: string;
  phone: string;
}

// Define interface for subscription
export interface ISubscription {
  tier: string;
  seats: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
}

// Define main Institution interface
export interface IInstitution extends Document {
  name: string;
  type: InstitutionType;
  address: IAddress;
  contactPerson: IContactPerson;
  subscription: ISubscription;
  classrooms: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Define schemas for nested objects
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

const ContactPersonSchema = new Schema<IContactPerson>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const SubscriptionSchema = new Schema<ISubscription>({
  tier: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    default: 'basic'
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String
  }
}, { _id: false });

// Define main Institution schema
const InstitutionSchema = new Schema<IInstitution>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: Object.values(InstitutionType),
    required: true
  },
  address: {
    type: AddressSchema,
    required: true
  },
  contactPerson: {
    type: ContactPersonSchema,
    required: true
  },
  subscription: {
    type: SubscriptionSchema,
    required: true
  },
  classrooms: [{
    type: Schema.Types.ObjectId,
    ref: 'Classroom'
  }]
}, {
  timestamps: true
});

// Create indexes for common queries
InstitutionSchema.index({ name: 1 });
InstitutionSchema.index({ 'subscription.tier': 1 });
InstitutionSchema.index({ 'subscription.endDate': 1 });

// Virtual for subscription status
InstitutionSchema.virtual('subscriptionStatus').get(function() {
  return this.subscription.endDate > new Date() ? 'active' : 'expired';
});

export default mongoose.model<IInstitution>('Institution', InstitutionSchema);

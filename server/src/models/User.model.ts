import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  whatsappNumber: string;
  city: string;
  socialHandle?: string;
  role: 'admin' | 'dropshipper';
  isApproved: boolean;
  shopify?: {
    storeName: string;
    accessToken: string;
    isConnected: boolean;
    status: 'pending' | 'active' | 'failed';
    connectedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  city: { type: String, required: true },
  socialHandle: { type: String },
  role: { type: String, enum: ['admin', 'dropshipper'], default: 'dropshipper' },
  isApproved: { type: Boolean, default: false },
  shopify: {
    storeName: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    isConnected: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'active', 'failed'],
      default: 'pending'
    },
    connectedAt: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);

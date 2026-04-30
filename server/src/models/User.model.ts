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
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);

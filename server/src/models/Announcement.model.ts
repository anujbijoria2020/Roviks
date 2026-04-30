import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);

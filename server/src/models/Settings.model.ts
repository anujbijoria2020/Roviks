import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ISettings>('Settings', settingsSchema);

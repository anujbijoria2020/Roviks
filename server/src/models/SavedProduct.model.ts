import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedProduct extends Document {
  dropshipperId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const savedProductSchema = new Schema<ISavedProduct>(
  {
    dropshipperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
  },
  { timestamps: true }
);

savedProductSchema.index({ dropshipperId: 1, productId: 1 }, { unique: true });

export default mongoose.model<ISavedProduct>('SavedProduct', savedProductSchema);

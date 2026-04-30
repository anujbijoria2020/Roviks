import mongoose, { Document, Schema } from 'mongoose';



export interface IMedia {

  url: string;

  type: 'image' | 'video' | 'pdf';

  isPrimary: boolean;

  sortOrder: number;

}



export interface IProduct extends Document {

  name: string;

  description: string;

  category: mongoose.Types.ObjectId;

  mrp: number;

  dropshipperPrice: number;

  moq: number;

  weight?: string;

  dimensions?: string;

  material?: string;

  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';

  isActive: boolean;

  media: IMedia[];

  downloadableUrl?: string;

  contentType: 'product' | 'mockup' | 'design';

  sizes: string[];

  profitMargin: number;

  createdAt: Date;

  updatedAt: Date;

}



const productSchema = new Schema<IProduct>({

  name: { type: String, required: true },

  description: { type: String, required: true },

  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

  mrp: { type: Number, required: true },

  dropshipperPrice: { type: Number, required: true },

  moq: { type: Number, default: 1 },

  weight: { type: String },

  dimensions: { type: String },

  material: { type: String },

  stockStatus: { 

    type: String, 

    enum: ['in_stock', 'low_stock', 'out_of_stock'], 

    default: 'in_stock' 

  },

  isActive: { type: Boolean, default: true },

  media: [{

    url: { type: String, required: true },

    type: { type: String, enum: ['image', 'video', 'pdf'], required: true },

    isPrimary: { type: Boolean, default: false },

    sortOrder: { type: Number, default: 0 }

  }],

  downloadableUrl: { type: String }

}, { 

  timestamps: true,

  toJSON: { virtuals: true },

  toObject: { virtuals: true }

});



productSchema.virtual('profitMargin').get(function() {

  return this.mrp - this.dropshipperPrice;

});



export default mongoose.model<IProduct>('Product', productSchema);


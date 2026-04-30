import mongoose, { Document, Schema } from 'mongoose';
import { CATALOG_CATEGORY_DEFINITIONS, type CatalogCategoryKind } from '../constants/catalogCategories';

export interface ICategory extends Document {
  name: string;
  slug: string;
  kind: CatalogCategoryKind;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['products', 'mockups', 'designs'], default: 'products' },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.pre('save', function() {
  const canonicalCategory = CATALOG_CATEGORY_DEFINITIONS.find((definition) => definition.slug === this.slug || definition.name === this.name);

  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  if (canonicalCategory) {
    this.name = canonicalCategory.name;
    this.slug = canonicalCategory.slug;
    this.kind = canonicalCategory.kind;
    this.sortOrder = canonicalCategory.sortOrder;
  }
});

export default mongoose.model<ICategory>('Category', categorySchema);

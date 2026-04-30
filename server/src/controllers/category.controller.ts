import { Request, Response } from 'express';
import Category from '../models/Category.model';
import { getCanonicalCategoryDefinition } from '../constants/catalogCategories';

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('GetAllCategories Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const normalizedName = name.trim();
    const canonicalCategory = getCanonicalCategoryDefinition(normalizedName);

    if (!canonicalCategory) {
      res.status(400).json({ message: 'Only Products, Mockups, and Designs categories are supported' });
      return;
    }

    const existingCategory = await Category.findOne({ slug: canonicalCategory.slug });
    if (existingCategory) {
      res.status(200).json(existingCategory);
      return;
    }

    const category = new Category({
      name: canonicalCategory.name,
      slug: canonicalCategory.slug,
      kind: canonicalCategory.kind,
      sortOrder: canonicalCategory.sortOrder,
    });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error('CreateCategory Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    console.error('DeleteCategory Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

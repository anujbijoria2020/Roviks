"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getAllCategories = void 0;
const Category_model_1 = __importDefault(require("../models/Category.model"));
const catalogCategories_1 = require("../constants/catalogCategories");
const getAllCategories = async (_req, res) => {
    try {
        const categories = await Category_model_1.default.find().sort({ sortOrder: 1, name: 1 });
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('GetAllCategories Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }
        const normalizedName = name.trim();
        const canonicalCategory = (0, catalogCategories_1.getCanonicalCategoryDefinition)(normalizedName);
        if (!canonicalCategory) {
            res.status(400).json({ message: 'Only Products, Mockups, and Designs categories are supported' });
            return;
        }
        const existingCategory = await Category_model_1.default.findOne({ slug: canonicalCategory.slug });
        if (existingCategory) {
            res.status(200).json(existingCategory);
            return;
        }
        const category = new Category_model_1.default({
            name: canonicalCategory.name,
            slug: canonicalCategory.slug,
            kind: canonicalCategory.kind,
            sortOrder: canonicalCategory.sortOrder,
        });
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        console.error('CreateCategory Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createCategory = createCategory;
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_model_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        await category.deleteOne();
        res.status(200).json({ message: 'Category deleted' });
    }
    catch (error) {
        console.error('DeleteCategory Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteCategory = deleteCategory;

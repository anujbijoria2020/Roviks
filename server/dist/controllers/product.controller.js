"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsaveProduct = exports.saveProduct = exports.getSavedProducts = exports.toggleProductStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const Category_model_1 = __importDefault(require("../models/Category.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const SavedProduct_model_1 = __importDefault(require("../models/SavedProduct.model"));
const getUploadsBaseUrl = () => '/uploads';
const allowsVideo = (kind) => kind !== 'designs';
const parseNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};
const buildImageMedia = (baseUploadsUrl, files, startIndex, existingPrimaryImage) => {
    if (!files || files.length === 0) {
        return [];
    }
    return files.map((file, index) => ({
        url: `${baseUploadsUrl}/${file.filename}`,
        type: 'image',
        isPrimary: !existingPrimaryImage && index === 0,
        sortOrder: startIndex + index
    }));
};
const buildVideoMedia = (baseUploadsUrl, files, sortOrder) => {
    if (!files || files.length === 0) {
        return [];
    }
    return files.map((file, index) => ({
        url: `${baseUploadsUrl}/${file.filename}`,
        type: 'video',
        isPrimary: false,
        sortOrder: sortOrder + index
    }));
};
const getUploadedFiles = (req) => {
    const files = req.files;
    return {
        images: files?.images ?? [],
        video: files?.video ?? []
    };
};
const getAllProducts = async (req, res) => {
    try {
        const { search, category, sortBy, stockStatus } = req.query;
        const isAdminUser = req.user?.role === 'admin';
        const query = {};
        if (!isAdminUser) {
            query.isActive = true;
        }
        if (typeof search === 'string' && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }
        if (typeof category === 'string' && category.trim()) {
            const categoryRecord = await Category_model_1.default.findOne({ slug: category.trim() });
            if (!categoryRecord) {
                res.status(200).json([]);
                return;
            }
            query.category = categoryRecord._id;
        }
        if (typeof stockStatus === 'string' && stockStatus.trim()) {
            query.stockStatus = stockStatus.trim();
        }
        let sort = { createdAt: -1 };
        if (sortBy === 'price_asc') {
            sort = { dropshipperPrice: 1 };
        }
        else if (sortBy === 'price_desc') {
            sort = { dropshipperPrice: -1 };
        }
        else if (sortBy === 'newest') {
            sort = { createdAt: -1 };
        }
        const products = await Product_model_1.default.find(query).populate('category', 'name slug').sort(sort);
        res.status(200).json(products);
    }
    catch (error) {
        console.error('GetAllProducts Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (_req, res) => {
    try {
        const product = await Product_model_1.default.findById(_req.params.id).populate('category', 'name slug');
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error('GetProductById Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, description, category, mrp, dropshipperPrice, moq, weight, dimensions, material, stockStatus } = req.body;
        const parsedMrp = parseNumber(mrp);
        const parsedDropshipperPrice = parseNumber(dropshipperPrice);
        const parsedMoq = parseNumber(moq) ?? 1;
        const { images, video } = getUploadedFiles(req);
        if (!name || !description || !category || parsedMrp === null || parsedDropshipperPrice === null) {
            res.status(400).json({ message: 'Required product fields are missing or invalid' });
            return;
        }
        const categoryRecord = await Category_model_1.default.findById(category);
        if (!categoryRecord) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        if (!allowsVideo(categoryRecord.kind) && video.length > 0) {
            res.status(400).json({ message: 'Designs only support image uploads' });
            return;
        }
        const uploadsBaseUrl = getUploadsBaseUrl();
        const media = [
            ...buildImageMedia(uploadsBaseUrl, images, 0, false),
            ...(allowsVideo(categoryRecord.kind) ? buildVideoMedia(uploadsBaseUrl, video, images.length) : [])
        ];
        const product = new Product_model_1.default({
            name,
            description,
            category,
            mrp: parsedMrp,
            dropshipperPrice: parsedDropshipperPrice,
            moq: parsedMoq,
            weight,
            dimensions,
            material,
            stockStatus,
            media
        });
        await product.save();
        const populatedProduct = await Product_model_1.default.findById(product._id).populate('category', 'name slug');
        res.status(201).json(populatedProduct ?? product);
    }
    catch (error) {
        console.error('CreateProduct Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await Product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const { name, description, category, mrp, dropshipperPrice, moq, weight, dimensions, material, stockStatus } = req.body;
        if (name !== undefined)
            product.name = name;
        if (description !== undefined)
            product.description = description;
        if (category !== undefined)
            product.category = category;
        const parsedMrp = parseNumber(mrp);
        if (mrp !== undefined) {
            if (parsedMrp === null) {
                res.status(400).json({ message: 'Invalid mrp value' });
                return;
            }
            product.mrp = parsedMrp;
        }
        const parsedDropshipperPrice = parseNumber(dropshipperPrice);
        if (dropshipperPrice !== undefined) {
            if (parsedDropshipperPrice === null) {
                res.status(400).json({ message: 'Invalid dropshipperPrice value' });
                return;
            }
            product.dropshipperPrice = parsedDropshipperPrice;
        }
        const parsedMoq = parseNumber(moq);
        if (moq !== undefined) {
            if (parsedMoq === null) {
                res.status(400).json({ message: 'Invalid moq value' });
                return;
            }
            product.moq = parsedMoq;
        }
        if (weight !== undefined)
            product.weight = weight;
        if (dimensions !== undefined)
            product.dimensions = dimensions;
        if (material !== undefined)
            product.material = material;
        if (stockStatus !== undefined)
            product.stockStatus = stockStatus;
        const { images, video } = getUploadedFiles(req);
        const categoryRecord = await Category_model_1.default.findById(category ?? product.category);
        if (!categoryRecord) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        if (!allowsVideo(categoryRecord.kind) && video.length > 0) {
            res.status(400).json({ message: 'Designs only support image uploads' });
            return;
        }
        const uploadsBaseUrl = getUploadsBaseUrl();
        if (images.length > 0 || video.length > 0) {
            const existingMedia = allowsVideo(categoryRecord.kind)
                ? [...product.media]
                : product.media.filter((mediaItem) => mediaItem.type === 'image');
            const hasPrimaryImage = existingMedia.some((mediaItem) => mediaItem.type === 'image' && mediaItem.isPrimary);
            const nextSortOrder = existingMedia.length;
            product.media = [
                ...existingMedia,
                ...buildImageMedia(uploadsBaseUrl, images, nextSortOrder, hasPrimaryImage),
                ...(allowsVideo(categoryRecord.kind) ? buildVideoMedia(uploadsBaseUrl, video, nextSortOrder + images.length) : [])
            ];
        }
        await product.save();
        const updatedProduct = await Product_model_1.default.findById(product._id).populate('category', 'name slug');
        res.status(200).json(updatedProduct ?? product);
    }
    catch (error) {
        console.error('UpdateProduct Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        await product.deleteOne();
        res.status(200).json({ message: 'Product deleted' });
    }
    catch (error) {
        console.error('DeleteProduct Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProduct = deleteProduct;
const toggleProductStatus = async (req, res) => {
    try {
        const product = await Product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        product.isActive = !product.isActive;
        await product.save();
        const updatedProduct = await Product_model_1.default.findById(product._id).populate('category', 'name slug');
        res.status(200).json(updatedProduct ?? product);
    }
    catch (error) {
        console.error('ToggleProductStatus Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleProductStatus = toggleProductStatus;
const getSavedProducts = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const saved = await SavedProduct_model_1.default.find({ dropshipperId: req.user.id })
            .populate({
            path: 'productId',
            populate: { path: 'category', select: 'name slug' }
        })
            .sort({ createdAt: -1 });
        const products = saved
            .map((item) => item.productId)
            .filter((product) => Boolean(product));
        res.status(200).json(products);
    }
    catch (error) {
        console.error('GetSavedProducts Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSavedProducts = getSavedProducts;
const saveProduct = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const productId = String(req.params.id);
        const product = await Product_model_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const existing = await SavedProduct_model_1.default.findOne({
            dropshipperId: req.user.id,
            productId
        });
        if (!existing) {
            await SavedProduct_model_1.default.create({
                dropshipperId: req.user.id,
                productId
            });
        }
        res.status(200).json({ message: 'Product saved' });
    }
    catch (error) {
        console.error('SaveProduct Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.saveProduct = saveProduct;
const unsaveProduct = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const productId = String(req.params.id);
        await SavedProduct_model_1.default.findOneAndDelete({
            dropshipperId: req.user.id,
            productId
        });
        res.status(200).json({ message: 'Product removed from saved list' });
    }
    catch (error) {
        console.error('UnsaveProduct Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.unsaveProduct = unsaveProduct;

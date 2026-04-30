import { Request, Response } from 'express';
import Category from '../models/Category.model';
import Product, { IMedia } from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import SavedProduct from '../models/SavedProduct.model';
import { type CatalogCategoryKind } from '../constants/catalogCategories';

const getUploadsBaseUrl = () => '/uploads';

const allowsVideo = (kind?: CatalogCategoryKind) => kind !== 'designs';

const parseNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildImageMedia = (
  baseUploadsUrl: string,
  files: Express.Multer.File[] | undefined,
  startIndex: number,
  existingPrimaryImage: boolean
): IMedia[] => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map((file, index) => ({
    url: `${baseUploadsUrl}/${file.filename}`,
    type: 'image' as const,
    isPrimary: !existingPrimaryImage && index === 0,
    sortOrder: startIndex + index
  }));
};

const buildVideoMedia = (
  baseUploadsUrl: string,
  files: Express.Multer.File[] | undefined,
  sortOrder: number
): IMedia[] => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map((file, index) => ({
    url: `${baseUploadsUrl}/${file.filename}`,
    type: 'video' as const,
    isPrimary: false,
    sortOrder: sortOrder + index
  }));
};

const buildPdfMedia = (
  baseUploadsUrl: string,
  files: Express.Multer.File[] | undefined,
  sortOrder: number
): IMedia[] => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map((file, index) => ({
    url: `${baseUploadsUrl}/${file.filename}`,
    type: 'pdf' as const,
    isPrimary: false,
    sortOrder: sortOrder + index
  }));
};

const getUploadedFiles = (req: Request): { images: Express.Multer.File[]; video: Express.Multer.File[]; pdf: Express.Multer.File[] } => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  return {
    images: files?.images ?? [],
    video: files?.video ?? [],
    pdf: files?.pdf ?? []
  };
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, sortBy, stockStatus, kind, contentType, size } = req.query;
    const isAdminUser = req.user?.role === 'admin';
    const query: Record<string, unknown> = {};

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
      const categoryRecord = await Category.findOne({ slug: category.trim() });
      if (!categoryRecord) {
        res.status(200).json([]);
        return;
      }

      query.category = categoryRecord._id;
    }

    if (typeof kind === 'string' && kind.trim()) {
      const categories = await Category.find({ kind: kind.trim() }).select('_id');
      const categoryIds = categories.map((c) => c._id);
      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      } else {
        res.status(200).json([]);
        return;
      }
    }

    if (typeof contentType === 'string' && contentType.trim()) {
      query.contentType = contentType.trim();
    }

    if (typeof size === 'string' && size.trim()) {
      query.sizes = size.trim();
    }

    if (typeof stockStatus === 'string' && stockStatus.trim()) {
      query.stockStatus = stockStatus.trim();
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sort = { dropshipperPrice: 1 };
    } else if (sortBy === 'price_desc') {
      sort = { dropshipperPrice: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    }

    const products = await Product.find(query).populate('category', 'name slug kind').sort(sort);
    res.status(200).json(products);
  } catch (error) {
    console.error('GetAllProducts Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(_req.params.id).populate('category', 'name slug');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('GetProductById Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      category,
      mrp,
      dropshipperPrice,
      moq,
      weight,
      dimensions,
      material,
      stockStatus,
      downloadableUrl,
      contentType,
      sizes
    } = req.body;

    const parsedMrp = parseNumber(mrp);
    const parsedDropshipperPrice = parseNumber(dropshipperPrice);
    const parsedMoq = parseNumber(moq) ?? 1;
    const { images, video, pdf } = getUploadedFiles(req);

    if (!name || !description || !category || parsedMrp === null || parsedDropshipperPrice === null) {
      res.status(400).json({ message: 'Required product fields are missing or invalid' });
      return;
    }

    const categoryRecord = await Category.findById(category);
    if (!categoryRecord) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (!allowsVideo(categoryRecord.kind) && video.length > 0) {
      res.status(400).json({ message: 'Designs only support image uploads' });
      return;
    }

    const uploadsBaseUrl = getUploadsBaseUrl();
    const media: IMedia[] = [
      ...buildImageMedia(uploadsBaseUrl, images, 0, false),
      ...(allowsVideo(categoryRecord.kind) ? buildVideoMedia(uploadsBaseUrl, video, images.length) : []),
      ...buildPdfMedia(uploadsBaseUrl, pdf, images.length + video.length)
    ];

    const product = new Product({
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
      media,
      downloadableUrl,
      contentType: contentType || 'product',
      sizes: Array.isArray(sizes) ? sizes : []
    });

    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json(populatedProduct ?? product);
  } catch (error) {
    console.error('CreateProduct Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const {
      name,
      description,
      category,
      mrp,
      dropshipperPrice,
      moq,
      weight,
      dimensions,
      material,
      stockStatus,
      downloadableUrl,
      contentType,
      sizes
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;

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

    if (weight !== undefined) product.weight = weight;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (material !== undefined) product.material = material;
    if (stockStatus !== undefined) product.stockStatus = stockStatus;
    if (downloadableUrl !== undefined) product.downloadableUrl = downloadableUrl;
    if (contentType !== undefined) product.contentType = contentType;
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : [];

    const { images, video, pdf } = getUploadedFiles(req);

    const categoryRecord = await Category.findById(category ?? product.category);
    if (!categoryRecord) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (!allowsVideo(categoryRecord.kind) && video.length > 0) {
      res.status(400).json({ message: 'Designs only support image uploads' });
      return;
    }

    const uploadsBaseUrl = getUploadsBaseUrl();
    if (images.length > 0 || video.length > 0 || pdf.length > 0) {
      const existingMedia = allowsVideo(categoryRecord.kind)
        ? [...product.media]
        : product.media.filter((mediaItem) => mediaItem.type === 'image');
      const hasPrimaryImage = existingMedia.some((mediaItem) => mediaItem.type === 'image' && mediaItem.isPrimary);
      const nextSortOrder = existingMedia.length;

      product.media = [
        ...existingMedia,
        ...buildImageMedia(uploadsBaseUrl, images, nextSortOrder, hasPrimaryImage),
        ...(allowsVideo(categoryRecord.kind) ? buildVideoMedia(uploadsBaseUrl, video, nextSortOrder + images.length) : []),
        ...buildPdfMedia(uploadsBaseUrl, pdf, nextSortOrder + images.length + video.length)
      ];
    }

    await product.save();
    const updatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(200).json(updatedProduct ?? product);
  } catch (error) {
    console.error('UpdateProduct Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DeleteProduct Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    product.isActive = !product.isActive;
    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('category', 'name slug');
    res.status(200).json(updatedProduct ?? product);
  } catch (error) {
    console.error('ToggleProductStatus Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSavedProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const saved = await SavedProduct.find({ dropshipperId: req.user.id })
      .populate({
        path: 'productId',
        populate: { path: 'category', select: 'name slug' }
      })
      .sort({ createdAt: -1 });

    const products = saved
      .map((item) => item.productId)
      .filter((product): product is NonNullable<typeof product> => Boolean(product));

    res.status(200).json(products);
  } catch (error) {
    console.error('GetSavedProducts Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const saveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const productId = String(req.params.id);
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const existing = await SavedProduct.findOne({
      dropshipperId: req.user.id,
      productId
    });

    if (!existing) {
      await SavedProduct.create({
        dropshipperId: req.user.id,
        productId
      });
    }

    res.status(200).json({ message: 'Product saved' });
  } catch (error) {
    console.error('SaveProduct Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unsaveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const productId = String(req.params.id);
    await SavedProduct.findOneAndDelete({
      dropshipperId: req.user.id,
      productId
    });

    res.status(200).json({ message: 'Product removed from saved list' });
  } catch (error) {
    console.error('UnsaveProduct Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

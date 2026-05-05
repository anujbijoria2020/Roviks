import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getSavedProducts,
  saveProduct,
  toggleProductStatus,
  unsaveProduct,
  updateProduct
} from '../controllers/product.controller';
import { isAdmin, verifyToken } from '../middleware/auth.middleware';
import { uploadProductMedia } from '../middleware/upload.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getAllProducts));
router.get('/saved', verifyToken, asyncHandler(getSavedProducts));
router.get('/:id', asyncHandler(getProductById));
router.post('/:id/save', verifyToken, asyncHandler(saveProduct));
router.delete('/:id/save', verifyToken, asyncHandler(unsaveProduct));
router.post('/', verifyToken, isAdmin, uploadProductMedia, asyncHandler(createProduct));
router.put('/:id', verifyToken, isAdmin, uploadProductMedia, asyncHandler(updateProduct));
router.delete('/:id', verifyToken, isAdmin, asyncHandler(deleteProduct));
router.patch('/:id/toggle', verifyToken, isAdmin, asyncHandler(toggleProductStatus));

export default router;

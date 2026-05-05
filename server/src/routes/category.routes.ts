import { Router } from 'express';
import { createCategory, deleteCategory, getAllCategories } from '../controllers/category.controller';
import { isAdmin, verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getAllCategories));
router.post('/', verifyToken, isAdmin, asyncHandler(createCategory));
router.delete('/:id', verifyToken, isAdmin, asyncHandler(deleteCategory));

export default router;

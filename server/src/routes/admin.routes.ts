import { Router } from 'express';
import {
  approveDropshipper,
  blockDropshipper,
  getAllDropshippers,
  getDropshipperOrders,
  getStats
} from '../controllers/admin.controller';
import { isAdmin, verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/stats', verifyToken, isAdmin, asyncHandler(getStats));
router.get('/dropshippers', verifyToken, isAdmin, asyncHandler(getAllDropshippers));
router.patch('/dropshippers/:id/approve', verifyToken, isAdmin, asyncHandler(approveDropshipper));
router.patch('/dropshippers/:id/block', verifyToken, isAdmin, asyncHandler(blockDropshipper));
router.get('/dropshippers/:id/orders', verifyToken, isAdmin, asyncHandler(getDropshipperOrders));

export default router;

import { Router } from 'express';
import { getOrders, placeOrder, updateOrderStatus } from '../controllers/order.controller';
import { isAdmin, isApprovedDropshipper, verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', verifyToken, isApprovedDropshipper, asyncHandler(placeOrder));
router.get('/', verifyToken, asyncHandler(getOrders));
router.patch('/:id/status', verifyToken, isAdmin, asyncHandler(updateOrderStatus));

export default router;

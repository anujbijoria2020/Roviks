import { Router } from 'express';
import {
  connectShopify,
  disconnectShopify,
  pushProductToShopify,
  shopifyCallback,
} from '../controllers/shopify.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/connect', verifyToken, asyncHandler(connectShopify));
router.get('/callback', asyncHandler(shopifyCallback));
router.delete('/disconnect', verifyToken, asyncHandler(disconnectShopify));
router.post('/push/:productId', verifyToken, asyncHandler(pushProductToShopify));

export default router;

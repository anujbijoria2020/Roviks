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
import { uploadDesignKitPdf as uploadDesignKitPdfController } from '../controllers/settings.controller';
import { uploadDesignKitPdf as uploadDesignKitPdfMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.get('/stats', verifyToken, isAdmin, asyncHandler(getStats));
router.get('/dropshippers', verifyToken, isAdmin, asyncHandler(getAllDropshippers));
router.patch('/dropshippers/:id/approve', verifyToken, isAdmin, asyncHandler(approveDropshipper));
router.patch('/dropshippers/:id/block', verifyToken, isAdmin, asyncHandler(blockDropshipper));
router.get('/dropshippers/:id/orders', verifyToken, isAdmin, asyncHandler(getDropshipperOrders));

// router.put('/settings', verifyToken, isAdmin, asyncHandler(updateSettings));
// router.get('/settings', verifyToken, isAdmin, asyncHandler(getSettings));
router.post('/settings/upload-design-kit', verifyToken, isAdmin, uploadDesignKitPdfMiddleware, asyncHandler(uploadDesignKitPdfController));

export default router;

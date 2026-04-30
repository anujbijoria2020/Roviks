import { Router } from 'express';
import {
	getDesignKitPdfUrl,
	getWhatsappNumber,
	updateDesignKitPdfUrl,
	updateWhatsappNumber,
	uploadDesignKitPdf,
} from '../controllers/settings.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import { uploadDesignKitPdf as uploadDesignKitPdfMiddleware } from '../middleware/upload.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/whatsapp', asyncHandler(getWhatsappNumber));
router.patch('/whatsapp', verifyToken, isAdmin, asyncHandler(updateWhatsappNumber));
router.get('/design-kit-pdf', asyncHandler(getDesignKitPdfUrl));
router.patch('/design-kit-pdf', verifyToken, isAdmin, asyncHandler(updateDesignKitPdfUrl));
router.post(
	'/design-kit-pdf/upload',
	verifyToken,
	isAdmin,
	uploadDesignKitPdfMiddleware,
	asyncHandler(uploadDesignKitPdf),
);

export default router;

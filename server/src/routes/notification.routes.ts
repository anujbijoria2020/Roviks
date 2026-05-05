import { Router } from 'express';
import { getNotifications, markAllRead } from '../controllers/notification.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', verifyToken, asyncHandler(getNotifications));
router.patch('/read-all', verifyToken, asyncHandler(markAllRead));

export default router;

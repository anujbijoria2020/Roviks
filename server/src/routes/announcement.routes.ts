import { Router } from 'express';
import { createAnnouncement, getAnnouncements, toggleAnnouncement } from '../controllers/announcement.controller';
import { isAdmin, verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', verifyToken, asyncHandler(getAnnouncements));
router.post('/', verifyToken, isAdmin, asyncHandler(createAnnouncement));
router.patch('/:id/toggle', verifyToken, isAdmin, asyncHandler(toggleAnnouncement));

export default router;

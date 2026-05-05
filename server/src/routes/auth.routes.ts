import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', verifyToken, asyncHandler(getMe));
router.patch('/me', verifyToken, asyncHandler(updateMe));

export default router;

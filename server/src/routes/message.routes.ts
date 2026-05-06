import { Router } from 'express'
import { createMessage, getMessages } from '../controllers/message.controller'
import { verifyToken, isAdmin } from '../middleware/auth.middleware'

const router = Router()

router.route('/').post(verifyToken, createMessage).get(verifyToken, isAdmin, getMessages)

export default router

import { Request, Response } from 'express'
import Message from '../models/Message.model'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../middleware/auth.middleware'

export const createMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, email, subject, message } = req.body
    const user = req.user

    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      user: user?._id,
    })

    await newMessage.save()

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    })
  },
)

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await Message.find().populate('user', 'fullName email')
  res.status(200).json({
    success: true,
    data: messages,
  })
})

import { Request, Response } from 'express';
import Notification from '../models/Notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }),
      Notification.countDocuments({ userId: req.user.id, isRead: false })
    ]);

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('GetNotifications Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await Notification.updateMany({ userId: req.user.id }, { isRead: true });
    res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    console.error('MarkAllRead Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

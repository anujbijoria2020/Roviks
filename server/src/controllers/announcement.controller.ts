import { Request, Response } from 'express';
import Announcement from '../models/Announcement.model';

export const getAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error('GetAnnouncements Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, expiresAt } = req.body;

    const announcement = new Announcement({
      title,
      message,
      expiresAt: expiresAt || undefined
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.error('CreateAnnouncement Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.status(200).json(announcement);
  } catch (error) {
    console.error('ToggleAnnouncement Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

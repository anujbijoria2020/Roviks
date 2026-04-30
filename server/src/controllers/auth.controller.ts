import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, whatsappNumber, city, socialHandle } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      whatsappNumber,
      city,
      socialHandle,
      role: 'dropshipper',
      isApproved: false
    });

    await newUser.save();

    res.status(201).json({ message: 'Account created successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.isApproved === false) {
      res.status(403).json({ message: 'Your account is pending approval' });
      return;
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    const userObj = user.toObject();
    delete (userObj as any).password;

    res.status(200).json({ token, user: userObj });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { fullName, phone, whatsappNumber, city, socialHandle } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, whatsappNumber, city, socialHandle },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('UpdateMe Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

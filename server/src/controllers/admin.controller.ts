import { Request, Response } from 'express';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import User from '../models/User.model';

const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = startOfDay(new Date());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const last30DaysStart = startOfDay(addDays(new Date(), -29));

    const [totalProducts, totalDropshippers, ordersToday, ordersThisMonth, statusGroups, last30DaysOrders] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({ role: 'dropshipper' }),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: last30DaysStart } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const ordersByStatus = orderStatuses.reduce<Record<string, number>>((accumulator, status) => {
      accumulator[status] = 0;
      return accumulator;
    }, {});

    statusGroups.forEach((item: { _id: string; count: number }) => {
      if (item._id in ordersByStatus) {
        ordersByStatus[item._id] = item.count;
      }
    });

    const last30DaysMap = new Map<string, number>();
    last30DaysOrders.forEach((item: { _id: string; count: number }) => {
      last30DaysMap.set(item._id, item.count);
    });

    const ordersLast30Days = Array.from({ length: 30 }, (_value, index) => {
      const date = addDays(last30DaysStart, index);
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        count: last30DaysMap.get(key) ?? 0
      };
    });

    res.status(200).json({
      totalProducts,
      totalDropshippers,
      ordersToday,
      ordersThisMonth,
      ordersByStatus,
      ordersLast30Days
    });
  } catch (error) {
    console.error('GetStats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllDropshippers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const dropshippers = await User.find({ role: 'dropshipper' }).select('-password');

    const dropshippersWithCounts = await Promise.all(
      dropshippers.map(async (dropshipper) => {
        const orderCount = await Order.countDocuments({ 
          dropshipperId: dropshipper._id,
          status: { $ne: 'cancelled' }
        });
        return {
          ...dropshipper.toObject(),
          orderCount
        };
      })
    );

    res.status(200).json(dropshippersWithCounts);
  } catch (error) {
    console.error('GetAllDropshippers Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveDropshipper = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({ message: 'Dropshipper approved' });
  } catch (error) {
    console.error('ApproveDropshipper Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const blockDropshipper = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isApproved = false;
    await user.save();

    res.status(200).json({ message: 'Dropshipper blocked' });
  } catch (error) {
    console.error('BlockDropshipper Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDropshipperOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ dropshipperId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('productId', 'name media');

    res.status(200).json(orders);
  } catch (error) {
    console.error('GetDropshipperOrders Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

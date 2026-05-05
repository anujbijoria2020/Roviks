import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.model';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';

const getPagination = (pageValue: unknown, limitValue: unknown) => {
  const page = Math.max(Number(pageValue) || 1, 1);
  const limit = Math.max(Number(limitValue) || 20, 1);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity, customerName, customerPhone, customerAddress, customerPincode, note } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < product.moq) {
      res.status(400).json({ message: `Quantity must be at least ${product.moq}` });
      return;
    }

    const order = new Order({
      dropshipperId: req.user.id,
      productId,
      quantity: parsedQuantity,
      customerName,
      customerPhone,
      customerAddress,
      customerPincode,
      note
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('PlaceOrder Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const isAdminUser = req.user.role === 'admin';
    const { status, dropshipperId, startDate, endDate, page, limit } = req.query;
    const { page: currentPage, limit: pageLimit, skip } = getPagination(page, limit);
    const query: Record<string, unknown> = {};

    if (isAdminUser) {
      if (typeof status === 'string' && status.trim()) {
        query.status = status.trim();
      }

      if (typeof dropshipperId === 'string' && dropshipperId.trim()) {
        query.dropshipperId = dropshipperId.trim();
      }

      const dateRange: Record<string, Date> = {};
      if (typeof startDate === 'string' && startDate.trim()) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateRange.$gte = start;
      }

      if (typeof endDate === 'string' && endDate.trim()) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateRange.$lte = end;
      }

      if (Object.keys(dateRange).length > 0) {
        query.createdAt = dateRange;
      }
    } else {
      query.dropshipperId = new mongoose.Types.ObjectId(req.user.id);

      if (typeof status === 'string' && status.trim()) {
        query.status = status.trim();
      }
    }

    const totalCount = await Order.countDocuments(query);

    const ordersQuery = Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    if (isAdminUser) {
      ordersQuery.populate('dropshipperId', 'fullName phone whatsappNumber');
    }

    ordersQuery.populate('productId', 'name media');

    const orders = await ordersQuery;
    const totalPages = Math.ceil(totalCount / pageLimit);

    res.status(200).json({ orders, totalCount, page: currentPage, totalPages });
  } catch (error) {
    console.error('GetOrders Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, trackingNumber, adminNote } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (status !== undefined) {
      order.status = status;
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    if (adminNote !== undefined) {
      order.adminNote = adminNote;
    }

    await order.save();

    await Notification.create({
      userId: order.dropshipperId,
      title: 'Order Status Updated',
      message: `Your order ${order.orderId} is now ${order.status}`
    });

    const updatedOrder = await Order.findById(order._id).populate('productId', 'name media');
    res.status(200).json(updatedOrder ?? order);
  } catch (error) {
    console.error('UpdateOrderStatus Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

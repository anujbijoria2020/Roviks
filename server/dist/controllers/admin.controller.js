"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDropshipperOrders = exports.blockDropshipper = exports.approveDropshipper = exports.getAllDropshippers = exports.getStats = void 0;
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const startOfDay = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
};
const addDays = (date, days) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
};
const getStats = async (_req, res) => {
    try {
        const today = startOfDay(new Date());
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const last30DaysStart = startOfDay(addDays(new Date(), -29));
        const [totalProducts, totalDropshippers, ordersToday, ordersThisMonth, statusGroups, last30DaysOrders] = await Promise.all([
            Product_model_1.default.countDocuments({}),
            User_model_1.default.countDocuments({ role: 'dropshipper' }),
            Order_model_1.default.countDocuments({ createdAt: { $gte: today } }),
            Order_model_1.default.countDocuments({ createdAt: { $gte: monthStart } }),
            Order_model_1.default.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Order_model_1.default.aggregate([
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
        const ordersByStatus = orderStatuses.reduce((accumulator, status) => {
            accumulator[status] = 0;
            return accumulator;
        }, {});
        statusGroups.forEach((item) => {
            if (item._id in ordersByStatus) {
                ordersByStatus[item._id] = item.count;
            }
        });
        const last30DaysMap = new Map();
        last30DaysOrders.forEach((item) => {
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
    }
    catch (error) {
        console.error('GetStats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStats = getStats;
const getAllDropshippers = async (_req, res) => {
    try {
        const dropshippers = await User_model_1.default.find({ role: 'dropshipper' }).select('-password');
        const dropshippersWithCounts = await Promise.all(dropshippers.map(async (dropshipper) => {
            const totalOrders = await Order_model_1.default.countDocuments({ dropshipperId: dropshipper._id });
            return {
                ...dropshipper.toObject(),
                totalOrders
            };
        }));
        res.status(200).json(dropshippersWithCounts);
    }
    catch (error) {
        console.error('GetAllDropshippers Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllDropshippers = getAllDropshippers;
const approveDropshipper = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.isApproved = true;
        await user.save();
        res.status(200).json({ message: 'Dropshipper approved' });
    }
    catch (error) {
        console.error('ApproveDropshipper Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.approveDropshipper = approveDropshipper;
const blockDropshipper = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.isApproved = false;
        await user.save();
        res.status(200).json({ message: 'Dropshipper blocked' });
    }
    catch (error) {
        console.error('BlockDropshipper Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.blockDropshipper = blockDropshipper;
const getDropshipperOrders = async (req, res) => {
    try {
        const orders = await Order_model_1.default.find({ dropshipperId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('productId', 'name media');
        res.status(200).json(orders);
    }
    catch (error) {
        console.error('GetDropshipperOrders Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDropshipperOrders = getDropshipperOrders;

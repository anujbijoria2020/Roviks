"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.getNotifications = void 0;
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const getNotifications = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const [notifications, unreadCount] = await Promise.all([
            Notification_model_1.default.find({ userId: req.user.id }).sort({ createdAt: -1 }),
            Notification_model_1.default.countDocuments({ userId: req.user.id, isRead: false })
        ]);
        res.status(200).json({ notifications, unreadCount });
    }
    catch (error) {
        console.error('GetNotifications Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getNotifications = getNotifications;
const markAllRead = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        await Notification_model_1.default.updateMany({ userId: req.user.id }, { isRead: true });
        res.status(200).json({ message: 'All marked as read' });
    }
    catch (error) {
        console.error('MarkAllRead Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.markAllRead = markAllRead;

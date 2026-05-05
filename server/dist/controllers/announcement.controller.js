"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAnnouncement = exports.createAnnouncement = exports.getAnnouncements = void 0;
const Announcement_model_1 = __importDefault(require("../models/Announcement.model"));
const getAnnouncements = async (_req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement_model_1.default.find({
            isActive: true,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(announcements);
    }
    catch (error) {
        console.error('GetAnnouncements Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAnnouncements = getAnnouncements;
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, expiresAt } = req.body;
        const announcement = new Announcement_model_1.default({
            title,
            message,
            expiresAt: expiresAt || undefined
        });
        await announcement.save();
        res.status(201).json(announcement);
    }
    catch (error) {
        console.error('CreateAnnouncement Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createAnnouncement = createAnnouncement;
const toggleAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement_model_1.default.findById(req.params.id);
        if (!announcement) {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        announcement.isActive = !announcement.isActive;
        await announcement.save();
        res.status(200).json(announcement);
    }
    catch (error) {
        console.error('ToggleAnnouncement Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleAnnouncement = toggleAnnouncement;

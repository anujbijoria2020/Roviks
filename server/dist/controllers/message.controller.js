"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.createMessage = void 0;
const Message_model_1 = __importDefault(require("../models/Message.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, subject, message } = req.body;
    const user = req.user;
    const newMessage = new Message_model_1.default({
        name,
        email,
        subject,
        message,
        user: user?._id,
    });
    await newMessage.save();
    res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage,
    });
});
exports.getMessages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const messages = await Message_model_1.default.find().populate('user', 'fullName email');
    res.status(200).json({
        success: true,
        data: messages,
    });
});

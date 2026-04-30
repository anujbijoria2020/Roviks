"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const register = async (req, res) => {
    try {
        const { fullName, email, password, phone, whatsappNumber, city, socialHandle } = req.body;
        const existingUser = await User_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_model_1.default({
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
    }
    catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
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
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({ token, user: userObj });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await User_model_1.default.findById(req.user.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { fullName, phone, whatsappNumber, city, socialHandle } = req.body;
        const user = await User_model_1.default.findByIdAndUpdate(req.user.id, { fullName, phone, whatsappNumber, city, socialHandle }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('UpdateMe Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateMe = updateMe;

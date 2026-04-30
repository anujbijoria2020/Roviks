"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApprovedDropshipper = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided or invalid format' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
exports.isAdmin = isAdmin;
const isApprovedDropshipper = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await User_model_1.default.findById(req.user.id);
        if (user && user.isApproved === true) {
            next();
        }
        else {
            res.status(403).json({ message: 'Account pending approval' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.isApprovedDropshipper = isApprovedDropshipper;

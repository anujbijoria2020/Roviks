"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWhatsappNumber = exports.getWhatsappNumber = void 0;
const Settings_model_1 = __importDefault(require("../models/Settings.model"));
const getWhatsappNumber = async (req, res) => {
    try {
        const setting = await Settings_model_1.default.findOne({ key: 'whatsappNumber' });
        res.status(200).json({ whatsappNumber: setting ? setting.value : null });
    }
    catch (error) {
        console.error('GetWhatsappNumber Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getWhatsappNumber = getWhatsappNumber;
const updateWhatsappNumber = async (req, res) => {
    try {
        const { value } = req.body;
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) {
            res.status(400).json({ message: 'Value is required' });
            return;
        }
        let setting = await Settings_model_1.default.findOne({ key: 'whatsappNumber' });
        if (setting) {
            setting.value = normalizedValue;
            await setting.save();
        }
        else {
            setting = new Settings_model_1.default({ key: 'whatsappNumber', value: normalizedValue });
            await setting.save();
        }
        res.status(200).json(setting);
    }
    catch (error) {
        console.error('UpdateWhatsappNumber Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateWhatsappNumber = updateWhatsappNumber;

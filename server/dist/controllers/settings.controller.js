"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDesignKitPdf = exports.updateDesignKitPdfUrl = exports.getDesignKitPdfUrl = exports.updateWhatsappNumber = exports.getWhatsappNumber = void 0;
const Settings_model_1 = __importDefault(require("../models/Settings.model"));
const getSettingValue = async (key) => {
    const setting = await Settings_model_1.default.findOne({ key });
    return setting ? setting.value : null;
};
const upsertSettingValue = async (key, value) => {
    let setting = await Settings_model_1.default.findOne({ key });
    if (setting) {
        setting.value = value;
        await setting.save();
    }
    else {
        setting = new Settings_model_1.default({ key, value });
        await setting.save();
    }
    return setting;
};
const buildPublicUploadUrl = (req, filename) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${filename}`;
};
const getWhatsappNumber = async (req, res) => {
    try {
        const whatsappNumber = await getSettingValue('whatsappNumber');
        res.status(200).json({ whatsappNumber });
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
        const setting = await upsertSettingValue('whatsappNumber', normalizedValue);
        res.status(200).json(setting);
    }
    catch (error) {
        console.error('UpdateWhatsappNumber Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateWhatsappNumber = updateWhatsappNumber;
const getDesignKitPdfUrl = async (req, res) => {
    try {
        const designKitPdfUrl = await getSettingValue('designKitPdfUrl');
        res.status(200).json({ designKitPdfUrl });
    }
    catch (error) {
        console.error('GetDesignKitPdfUrl Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDesignKitPdfUrl = getDesignKitPdfUrl;
const updateDesignKitPdfUrl = async (req, res) => {
    try {
        const { value } = req.body;
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) {
            res.status(400).json({ message: 'Value is required' });
            return;
        }
        const setting = await upsertSettingValue('designKitPdfUrl', normalizedValue);
        res.status(200).json(setting);
    }
    catch (error) {
        console.error('UpdateDesignKitPdfUrl Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateDesignKitPdfUrl = updateDesignKitPdfUrl;
const uploadDesignKitPdf = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'PDF file is required' });
            return;
        }
        const designKitPdfUrl = buildPublicUploadUrl(req, file.filename);
        const setting = await upsertSettingValue('designKitPdfUrl', designKitPdfUrl);
        res.status(200).json({ designKitPdfUrl, setting });
    }
    catch (error) {
        console.error('UploadDesignKitPdf Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.uploadDesignKitPdf = uploadDesignKitPdf;

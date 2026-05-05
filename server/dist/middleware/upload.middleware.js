"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDesignKitPdf = exports.uploadProductMedia = exports.uploadVideo = exports.uploadImages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadDirectory = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDirectory)) {
    fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (_req, file, callback) => {
        const sanitizedName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
        callback(null, `${Date.now()}-${sanitizedName}`);
    }
});
const fileFilter = (_req, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
        return;
    }
    callback(new Error('Only jpg, jpeg, png, webp, mp4, and pdf files are allowed'));
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});
exports.uploadImages = upload.fields([{ name: 'images', maxCount: 10 }]);
exports.uploadVideo = upload.fields([{ name: 'video', maxCount: 1 }]);
exports.uploadProductMedia = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]);
exports.uploadDesignKitPdf = upload.single('designKit');

import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const sanitizedName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    callback(null, `${Date.now()}-${sanitizedName}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error('Only jpg, jpeg, png, webp, mp4, and pdf files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

export const uploadImages = upload.fields([{ name: 'images', maxCount: 10 }]);
export const uploadVideo = upload.fields([{ name: 'video', maxCount: 1 }]);
export const uploadProductMedia = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);
export const uploadDesignKitPdf = upload.single('designKitPdf');

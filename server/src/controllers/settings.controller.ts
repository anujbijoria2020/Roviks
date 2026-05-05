import { Request, Response } from 'express';
import Settings from '../models/Settings.model';

const getSettingValue = async (key: string): Promise<string | null> => {
  const setting = await Settings.findOne({ key });
  return setting ? setting.value : null;
};

const upsertSettingValue = async (key: string, value: string) => {
  let setting = await Settings.findOne({ key });

  if (setting) {
    setting.value = value;
    await setting.save();
  } else {
    setting = new Settings({ key, value });
    await setting.save();
  }

  return setting;
};

const buildPublicUploadUrl = (req: Request, filename: string) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

export const getWhatsappNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const whatsappNumber = await getSettingValue('whatsappNumber');
    res.status(200).json({ whatsappNumber });
  } catch (error) {
    console.error('GetWhatsappNumber Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateWhatsappNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value } = req.body;
    const normalizedValue = typeof value === 'string' ? value.trim() : '';

    if (!normalizedValue) {
      res.status(400).json({ message: 'Value is required' });
      return;
    }

    const setting = await upsertSettingValue('whatsappNumber', normalizedValue);

    res.status(200).json(setting);
  } catch (error) {
    console.error('UpdateWhatsappNumber Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDesignKitPdfUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const designKitPdfUrl = await getSettingValue('designKitPdfUrl');
    res.status(200).json({ designKitPdfUrl });
  } catch (error) {
    console.error('GetDesignKitPdfUrl Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDesignKitPdfUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value } = req.body;
    const normalizedValue = typeof value === 'string' ? value.trim() : '';

    if (!normalizedValue) {
      res.status(400).json({ message: 'Value is required' });
      return;
    }

    const setting = await upsertSettingValue('designKitPdfUrl', normalizedValue);

    res.status(200).json(setting);
  } catch (error) {
    console.error('UpdateDesignKitPdfUrl Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadDesignKitPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'PDF file is required' });
      return;
    }

    const designKitPdfUrl = buildPublicUploadUrl(req, file.filename);
    const setting = await upsertSettingValue('designKitPdfUrl', designKitPdfUrl);

    res.status(200).json({ designKitPdfUrl, setting });
  } catch (error) {
    console.error('UploadDesignKitPdf Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

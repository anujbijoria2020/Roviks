import api from './axios'

export const getWhatsappNumber = () => api.get('/settings/whatsapp')
export const getDesignKitPdfUrl = () => api.get('/settings/design-kit-pdf')

export const updateWhatsappNumber = (value: string) =>
  api.patch('/settings/whatsapp', { value })

export const updateDesignKitPdfUrl = (value: string) =>
  api.patch('/settings/design-kit-pdf', { value })

export const uploadDesignKitPdf = (file: File) => {
  const formData = new FormData();
  formData.append('designKit', file);
  return api.post('/admin/settings/upload-design-kit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
import api from './axios'

export const getWhatsappNumber = () => api.get('/settings/whatsapp')
export const getDesignKitPdfUrl = () => api.get('/settings/design-kit-pdf')

export const updateWhatsappNumber = (value: string) =>
  api.patch('/settings/whatsapp', { value })

export const updateDesignKitPdfUrl = (value: string) =>
  api.patch('/settings/design-kit-pdf', { value })

export const uploadDesignKitPdf = (file: File) => {
  const formData = new FormData()
  formData.append('designKitPdf', file)

  return api.post('/settings/design-kit-pdf/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
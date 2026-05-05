import api from './axios'

export const getStats = () => api.get('/admin/stats')

export const getAllDropshippers = () => api.get('/admin/dropshippers')

export const approveDropshipper = (id: string) => api.patch(`/admin/dropshippers/${id}/approve`)

export const blockDropshipper = (id: string) => api.patch(`/admin/dropshippers/${id}/block`)

export const getDropshipperOrders = (id: string) => api.get(`/admin/dropshippers/${id}/orders`)

export const getNotifications = () => api.get('/notifications')

export const markAllRead = () => api.patch('/notifications/read-all')

export const getAnnouncements = () => api.get('/announcements')

export const createAnnouncement = (data: Record<string, unknown>) =>
  api.post('/announcements', data)

export const toggleAnnouncement = (id: string) => api.patch(`/announcements/${id}/toggle`)

export const getWhatsappNumber = () => api.get('/settings/whatsapp')

export const updateWhatsappNumber = (value: string) =>
  api.patch('/settings/whatsapp', { value })

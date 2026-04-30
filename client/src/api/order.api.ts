import api from './axios'

export const placeOrder = (data: Record<string, unknown>) => api.post('/orders', data)

export const getOrders = (params?: Record<string, unknown>) => api.get('/orders', { params })

export const updateOrderStatus = (id: string, data: Record<string, unknown>) =>
  api.patch(`/orders/${id}/status`, data)

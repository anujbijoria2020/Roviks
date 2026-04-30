import api from './axios'

export const getAllProducts = (params?: Record<string, unknown>) =>
  api.get('/products', { params })

export const getProductById = (id: string) => api.get(`/products/${id}`)

export const createProduct = (formData: FormData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateProduct = (id: string, formData: FormData) =>
  api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteProduct = (id: string) => api.delete(`/products/${id}`)

export const toggleProduct = (id: string) => api.patch(`/products/${id}/toggle`)

export const getAllCategories = () => api.get('/categories')

export const createCategory = (data: Record<string, unknown>) => api.post('/categories', data)

export const deleteCategory = (id: string) => api.delete(`/categories/${id}`)

export const getSavedProducts = () => api.get('/products/saved')

export const saveProduct = (productId: string) => api.post(`/products/${productId}/save`)

export const unsaveProduct = (productId: string) => api.delete(`/products/${productId}/save`)

import api from './axios'
import type { User } from '../types/index'

export const registerUser = (data: Record<string, unknown>) => api.post('/auth/register', data)

export const loginUser = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

export const getMe = () => api.get('/auth/me')

export const updateMe = (data: Partial<User>) => api.patch('/auth/me', data)

import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined
const normalizedApiUrl = rawApiUrl?.trim()?.replace(/\/+$/, '') || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: normalizedApiUrl,
})

api.interceptors.request.use((config) => {
  if (config.url && !/^https?:\/\//i.test(config.url)) {
    // Keep requests relative to baseURL path (e.g., /api) even if callers pass "/endpoint".
    config.url = config.url.replace(/^\/+/, '')
  }

  const token = localStorage.getItem('roviks_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('roviks_token')
      localStorage.removeItem('roviks_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api

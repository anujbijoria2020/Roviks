import api from './axios'

export const sendMessage = (data: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  return api.post('/messages', data)
}

export const getMessages = () => {
  return api.get('/messages')
}

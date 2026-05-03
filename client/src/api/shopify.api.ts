import api from './axios'

export const connectShopify = (data: { storeName: string }) =>
  api.post('/shopify/connect', data)

export const disconnectShopify = () =>
  api.delete('/shopify/disconnect')

export const pushToShopify = (productId: string) =>
  api.post(`/shopify/push/${productId}`)

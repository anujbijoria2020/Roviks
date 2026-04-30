export interface User {
  _id: string
  fullName: string
  email: string
  phone: string
  whatsappNumber: string
  city: string
  socialHandle?: string
  role: 'admin' | 'dropshipper'
  isApproved: boolean
  createdAt: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  kind: 'products' | 'mockups' | 'designs'
  sortOrder: number
}

export interface ProductMedia {
  url: string
  type: 'image' | 'video' | 'pdf'
  isPrimary: boolean
  sortOrder: number
}

export interface Product {
  _id: string
  name: string
  description: string
  category: Category
  mrp: number
  dropshipperPrice: number
  profitMargin: number
  moq: number
  weight?: string
  dimensions?: string
  material?: string
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  isActive: boolean
  media: ProductMedia[]
  downloadableUrl?: string
  contentType: 'product' | 'mockup' | 'design'
  sizes: string[]
  createdAt: string
}

export interface Order {
  _id: string
  orderId: string
  dropshipperId: User
  productId: Product
  quantity: number
  customerName: string
  customerPhone: string
  customerAddress: string
  customerPincode: string
  note?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  adminNote?: string
  createdAt: string
}

export interface Notification {
  _id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface Announcement {
  _id: string
  title: string
  message: string
  isActive: boolean
  expiresAt?: string
}

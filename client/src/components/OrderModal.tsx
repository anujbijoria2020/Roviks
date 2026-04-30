import { Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import { getWhatsappNumber } from '../api/settings.api'
import { placeOrder } from '../api/order.api'
import { useAuth } from '../context/AuthContext'
import { getImageUrl, handleImageError } from '../utils/imageUrl'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import type { Product } from '../types/index'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

const OrderModal = ({ isOpen, onClose, product }: OrderModalProps) => {
  const { user } = useAuth()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPincode, setCustomerPincode] = useState('')
  const [quantity, setQuantity] = useState(product.moq)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setQuantity(product.moq)
  }, [product.moq, isOpen])

  if (!isOpen) {
    return null
  }

  const productImage = product.media.find((item) => item.type === 'image' && item.isPrimary)?.url

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!customerName || !customerPhone || !customerAddress || !customerPincode || !quantity) {
      toast.error('Please fill all required fields.')
      return
    }
    if (quantity < product.moq) {
      toast.error(`Minimum order quantity is ${product.moq}.`)
      return
    }

    if (!user) {
      toast.error('Please login to place an order.')
      return
    }

    setIsSubmitting(true)

    try {
      const orderRes = await placeOrder({
        productId: product._id,
        quantity,
        customerName,
        customerPhone,
        customerAddress,
        customerPincode,
        note,
      })

      const orderId = orderRes.data?.orderId

      const whatsappRes = await getWhatsappNumber()
      const whatsappNumber =
        whatsappRes.data?.value ??
        whatsappRes.data?.whatsappNumber ??
        whatsappRes.data?.settings?.value

      if (!whatsappNumber) {
        toast.error('WhatsApp number is not configured yet.')
        return
      }

      const msg = `━━━━━━━━━━━━━━━━━━
🛒 *NEW ORDER — ROVIKS*
━━━━━━━━━━━━━━━━━━

🆔 *Order ID:* #${orderId}

👤 *Dropshipper Details*
- Name: ${user.fullName}
- WhatsApp: ${user.whatsappNumber}

📦 *Product Details*
- Name: ${product.name}
- Qty: ${quantity} units
- Price/unit: ₹${product.dropshipperPrice}
- 💰 Total: ₹${product.dropshipperPrice * quantity}

🧑 *Customer Details*
- Name: ${customerName}
- Phone: ${customerPhone}
- Address: ${customerAddress}
- Pincode: ${customerPincode}

📝 *Note:* ${note || 'None'}

━━━━━━━━━━━━━━━━━━`

      const whatsappUrl = buildWhatsAppUrl(whatsappNumber, msg)

      if (!whatsappUrl) {
        toast.error('WhatsApp number is not configured yet.')
        return
      }

      window.open(whatsappUrl, '_blank')
      toast.success('Order placed! WhatsApp opened.')
      onClose()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to place order right now.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/80 backdrop-blur-sm"
      />

      <div className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-6">
          <div className="relative">
            <h2 className="text-xl font-bold text-white">Place Order</h2>
            <p className="mt-1 pr-10 text-sm text-zinc-400">{product.name}</p>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-0 text-zinc-400 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl bg-[#111111] p-3">
            {productImage ? (
              <img src={getImageUrl(productImage)} alt={product.name} className="h-16 w-16 rounded-lg object-cover" onError={handleImageError} />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-zinc-800" />
            )}
            <div>
              <p className="text-sm font-medium text-white">{product.name}</p>
              <p className="mt-1 text-sm text-orange-500">₹{product.dropshipperPrice}/unit</p>
              <p className="mt-1 text-xs text-zinc-500">Min order: {product.moq} units</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Customer Name"
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Customer Phone"
              required
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Customer Address"
              required
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <input
              type="text"
              maxLength={6}
              placeholder="Pincode"
              required
              value={customerPincode}
              onChange={(event) => setCustomerPincode(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <input
              type="number"
              min={product.moq}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Optional note for wholesaler..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-bold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Send Order via WhatsApp</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderModal

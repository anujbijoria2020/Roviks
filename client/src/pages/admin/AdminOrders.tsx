import { MessageCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getOrders, updateOrderStatus } from '../../api/order.api'
import Badge from '../../components/ui/Badge'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Order } from '../../types/index'

const tabs = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [status, setStatus] = useState('pending')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [adminNote, setAdminNote] = useState('')

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await getOrders({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      })
      const list = (response.data?.orders ?? response.data ?? []) as Order[]
      setOrders(Array.isArray(list) ? list : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchOrders()
  }, [selectedStatus])

  const openDrawer = (order: Order) => {
    setSelectedOrder(order)
    setStatus(order.status)
    setTrackingNumber(order.trackingNumber ?? '')
    setAdminNote(order.adminNote ?? '')
    setIsDrawerOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return
    setUpdatingId(selectedOrder._id)
    try {
      await updateOrderStatus(selectedOrder._id, { status, trackingNumber, adminNote })
      toast.success('Order updated')
      setIsDrawerOpen(false)
      await fetchOrders()
    } catch {
      toast.error('Unable to update order')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-foreground">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Orders</h1>
        <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-foreground-secondary">{orders.length}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedStatus(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
              selectedStatus === tab
                ? 'bg-primary text-foreground'
                : 'border border-border bg-surface-secondary text-foreground-muted hover:border-zinc-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-secondary">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Dropshipper</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const image = order.productId?.media?.find((m) => m.type === 'image')?.url
                  return (
                    <tr key={order._id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-sm text-primary">{order.orderId}</td>
                      <td className="px-4 py-3 text-sm">
                        <p className="text-foreground">{order.dropshipperId?.fullName}</p>
                        <p className="text-xs text-foreground-muted">{order.dropshipperId?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {image ? (
                            <img src={getImageUrl(image)} alt={order.productId?.name} className="h-10 w-10 rounded object-cover" onError={handleImageError} />
                          ) : (
                            <div className="h-10 w-10 rounded bg-surface-secondary" />
                          )}
                          <p className="max-w-28 truncate text-sm text-foreground">{order.productId?.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className="text-foreground">{order.customerName}</p>
                        <p className="text-xs text-foreground-muted">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{order.quantity}</td>
                      <td className="px-4 py-3 text-sm text-foreground-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openDrawer(order)}
                          className="text-xs text-primary hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDrawerOpen ? (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/50"
          aria-label="Close order management drawer"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[480px] max-w-[90vw] border-l border-border bg-surface transition-transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedOrder ? (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between p-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Manage Order</h2>
                <p className="mt-1 font-mono text-sm text-primary">{selectedOrder.orderId}</p>
              </div>
              <button type="button" onClick={() => setIsDrawerOpen(false)} className="text-foreground-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-surface-secondary p-4">
                  <p className="mb-3 text-xs uppercase text-foreground-muted">Dropshipper</p>
                  <p className="text-foreground">{selectedOrder.dropshipperId?.fullName}</p>
                  <p className="mt-1 text-foreground-muted">{selectedOrder.dropshipperId?.phone}</p>
                  <p className="mt-1 text-foreground-muted">{selectedOrder.dropshipperId?.whatsappNumber}</p>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(`https://wa.me/${selectedOrder.dropshipperId?.whatsappNumber ?? ''}`, '_blank')
                    }
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs text-foreground"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Contact on WhatsApp
                  </button>
                </div>

                <div className="rounded-xl bg-surface-secondary p-4">
                  <p className="mb-3 text-xs uppercase text-foreground-muted">Customer Details</p>
                  <p className="text-foreground">{selectedOrder.customerName}</p>
                  <p className="mt-1 text-foreground-muted">{selectedOrder.customerPhone}</p>
                  <p className="mt-1 text-foreground-muted">{selectedOrder.customerAddress}</p>
                  <p className="mt-1 text-foreground-muted">{selectedOrder.customerPincode}</p>
                </div>

                <div className="flex gap-3 rounded-xl bg-surface-secondary p-4">
                  {selectedOrder.productId?.media?.[0]?.url ? (
                    <img
                      src={getImageUrl(selectedOrder.productId.media[0].url)}
                      alt={selectedOrder.productId?.name}
                      className="h-14 w-14 rounded object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="h-14 w-14 rounded bg-surface-secondary" />
                  )}
                  <div>
                    <p className="text-foreground">{selectedOrder.productId?.name}</p>
                    <p className="mt-1 text-foreground-muted">Qty: {selectedOrder.quantity}</p>
                    <p className="mt-1 text-foreground-muted">
                      Total: ₹{(selectedOrder.productId?.dropshipperPrice ?? 0) * selectedOrder.quantity}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-foreground-muted">Update Order Status</p>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="Tracking number (optional)"
                  className="mt-3 w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="Note for dropshipper (optional)"
                  className="mt-3 w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-border p-5">
              <button
                type="button"
                disabled={updatingId === selectedOrder._id}
                onClick={() => void handleUpdateStatus()}
                className="w-full rounded-xl bg-primary py-3 font-bold text-foreground disabled:opacity-60"
              >
                Update Order Status
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

export default AdminOrders

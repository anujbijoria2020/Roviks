import { Package, X, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '../../api/order.api'
import Badge from '../../components/ui/Badge'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Order } from '../../types/index'

const statusTabs = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const timelineSteps = ['pending', 'confirmed', 'shipped', 'delivered']

const MyOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const response = await getOrders({
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        })
        const list = (response.data?.orders ?? response.data ?? []) as Order[]
        setOrders(Array.isArray(list) ? list : [])
      } catch {
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchOrders()
  }, [selectedStatus])

  const currentStatusIndex = useMemo(() => {
    if (!selectedOrder || selectedOrder.status === 'cancelled') return -1
    return timelineSteps.indexOf(selectedOrder.status)
  }, [selectedOrder])

  return (
    <div className="relative animate-[fadeIn_0.2s_ease] text-foreground">
      <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
      <p className="mt-1 text-foreground-muted">Track all your placed orders.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusTabs.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelectedStatus(status)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
              selectedStatus === status
                ? 'bg-primary text-foreground'
                : 'border border-border bg-surface-secondary text-foreground-muted hover:border-zinc-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="mb-3 h-16 animate-pulse rounded-xl bg-surface-secondary" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <Package className="h-16 w-16 text-zinc-600" />
          <p className="mt-4 text-lg text-foreground-muted">No orders found</p>
          <p className="mt-1 text-sm text-zinc-600">Start by ordering from the catalog</p>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-secondary">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
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
                  const imageUrl =
                    order.productId?.media?.find((m) => m.type === 'image' && m.isPrimary)?.url ||
                    order.productId?.media?.find((m) => m.type === 'image')?.url

                  return (
                    <tr
                      key={order._id}
                      className="border-b border-border transition hover:bg-[#1f1f1f] last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium text-primary">
                        {order.orderId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={getImageUrl(imageUrl)}
                              alt={order.productId?.name}
                              className="h-10 w-10 rounded-lg bg-surface object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-surface" />
                          )}
                          <p className="max-w-32 truncate text-sm text-foreground">{order.productId?.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted">
                        <p>{order.customerName}</p>
                        <p className="text-xs text-zinc-600">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{order.quantity}</td>
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
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDrawerOpen(true)
                          }}
                          className="cursor-pointer text-xs text-primary hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isDrawerOpen ? (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/50"
          aria-label="Close details drawer overlay"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-96 border-l border-border bg-surface p-5 transition-transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Order Details</h2>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="text-foreground-muted transition hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedOrder ? (
          <div className="mt-6 space-y-4 text-sm">
            <p className="font-mono text-primary">{selectedOrder.orderId}</p>

            <div className="flex items-center gap-3">
              {selectedOrder.productId?.media?.[0]?.url ? (
                <img
                  src={getImageUrl(selectedOrder.productId.media[0].url)}
                  alt={selectedOrder.productId.name}
                  className="h-14 w-14 rounded-lg object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-surface-secondary" />
              )}
              <p className="text-foreground">{selectedOrder.productId?.name}</p>
            </div>

            <div className="rounded-xl bg-surface-secondary p-4 text-foreground-secondary">
              <p>
                <span className="text-foreground-muted">Name:</span> {selectedOrder.customerName}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">Phone:</span> {selectedOrder.customerPhone}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">Address:</span> {selectedOrder.customerAddress}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">Pincode:</span> {selectedOrder.customerPincode}
              </p>
            </div>

            <div className="text-foreground-secondary">
              <p>
                <span className="text-foreground-muted">Quantity:</span> {selectedOrder.quantity}
              </p>
              {selectedOrder.note ? (
                <p className="mt-2">
                  <span className="text-foreground-muted">Note:</span> {selectedOrder.note}
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <p className="mb-4 text-sm font-medium text-foreground-muted">Order Timeline</p>

              {selectedOrder.status === 'cancelled' ? (
                <div className="flex items-center gap-3 text-red-400">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20">
                    <XCircle className="h-4 w-4" />
                  </span>
                  <span>Order Cancelled</span>
                </div>
              ) : (
                <div>
                  {timelineSteps.map((step, index) => {
                    const isCompleted = currentStatusIndex >= index
                    const isCurrent = currentStatusIndex === index

                    return (
                      <div key={step} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < timelineSteps.length - 1 ? (
                          <span
                            className={`absolute left-[13px] top-7 h-[calc(100%-12px)] w-[2px] ${
                              currentStatusIndex > index ? 'bg-primary' : 'bg-surface-secondary'
                            }`}
                          />
                        ) : null}
                        <span
                          className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                            isCurrent
                              ? 'bg-primary ring-4 ring-orange-500/30'
                              : isCompleted
                                ? 'bg-primary text-foreground'
                                : 'bg-surface-secondary text-zinc-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <p className={`${isCompleted ? 'text-foreground' : 'text-zinc-600'} capitalize`}>{step}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedOrder.trackingNumber ? (
                <div className="mt-4 rounded-lg bg-surface-secondary p-3">
                  <p className="text-xs text-foreground-muted">Tracking Number</p>
                  <p className="font-mono text-foreground">{selectedOrder.trackingNumber}</p>
                </div>
              ) : null}

              {selectedOrder.adminNote ? (
                <div className="mt-3">
                  <p className="text-xs text-foreground-muted">Note from Admin</p>
                  <p className="text-sm text-foreground-secondary">{selectedOrder.adminNote}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

export default MyOrdersPage

import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { approveDropshipper, blockDropshipper, getAllDropshippers, getDropshipperOrders } from '../../api/admin.api'
import Badge from '../../components/ui/Badge'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import type { Order, User } from '../../types/index'

type DropshipperWithOrderCount = User & { orderCount: number }

const AdminDropshippers = () => {
  const [dropshippers, setDropshippers] = useState<DropshipperWithOrderCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDropshipper, setSelectedDropshipper] = useState<User | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [dropshipperOrders, setDropshipperOrders] = useState<Order[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchDropshippers = async () => {
    setIsLoading(true)
    try {
      const response = await getAllDropshippers()
      const list = (response.data?.dropshippers ?? response.data ?? []) as DropshipperWithOrderCount[]
      setDropshippers(Array.isArray(list) ? list : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchDropshippers()
  }, [])

  const filteredDropshippers = useMemo(
    () =>
      dropshippers.filter(
        (item) =>
          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
          item.city.toLowerCase().includes(search.toLowerCase()),
      ),
    [dropshippers, search],
  )

  const handleApprove = async (id: string) => {
    setUpdatingId(id)
    await approveDropshipper(id)
    await fetchDropshippers()
    setUpdatingId(null)
  }

  const handleBlock = async (id: string) => {
    setUpdatingId(id)
    await blockDropshipper(id)
    await fetchDropshippers()
    setUpdatingId(null)
  }

  const handleHistory = async (dropshipper: User) => {
    const response = await getDropshipperOrders(dropshipper._id)
    const list = (response.data?.orders ?? response.data ?? []) as Order[]
    setDropshipperOrders(Array.isArray(list) ? list : [])
    setSelectedDropshipper(dropshipper)
    setIsHistoryModalOpen(true)
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-foreground">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Dropshippers</h1>
        <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-foreground-secondary">{dropshippers.length}</span>
      </div>

      <div className="mt-4 max-w-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or city..."
          className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDropshippers.map((dropshipper) => (
                  <tr key={dropshipper._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                          {(dropshipper.fullName[0] ?? 'D').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{dropshipper.fullName}</p>
                          <p className="text-xs text-foreground-muted">{dropshipper.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="text-foreground">{dropshipper.phone}</p>
                      <p className="text-xs text-foreground-muted">{dropshipper.whatsappNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted">{dropshipper.city}</td>
                    <td className="px-4 py-3 text-sm text-foreground-muted">
                      {new Date(dropshipper.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{dropshipper.orderCount ?? 0}</p>
                      <p className="text-xs text-foreground-muted">orders</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          dropshipper.isApproved
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {dropshipper.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!dropshipper.isApproved ? (
                          <button
                            type="button"
                            disabled={updatingId === dropshipper._id}
                            onClick={() => void handleApprove(dropshipper._id)}
                            className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs text-green-500 transition hover:bg-green-500 hover:text-foreground"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingId === dropshipper._id}
                            onClick={() => void handleBlock(dropshipper._id)}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-500 hover:text-foreground"
                          >
                            Block
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleHistory(dropshipper)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground-muted transition hover:border-primary hover:text-primary"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isHistoryModalOpen && selectedDropshipper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface-secondary p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Order History - {selectedDropshipper.fullName}</h2>
              <button type="button" onClick={() => setIsHistoryModalOpen(false)} className="text-foreground-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {dropshipperOrders.length === 0 ? (
              <p className="py-12 text-center text-foreground-muted">No orders placed yet</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-left text-xs uppercase text-foreground-muted">
                    <tr>
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropshipperOrders.map((order) => (
                      <tr key={order._id} className="border-t border-border">
                        <td className="px-3 py-2 text-sm text-primary">{order.orderId}</td>
                        <td className="px-3 py-2 text-sm text-foreground">{order.productId?.name}</td>
                        <td className="px-3 py-2 text-sm text-foreground">{order.quantity}</td>
                        <td className="px-3 py-2 text-sm text-foreground-muted">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-3 py-2">
                          <Badge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminDropshippers

import { Box, CheckCircle, Clock, Megaphone, Package, ShoppingBag, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnnouncements } from '../../api/admin.api'
import { getOrders } from '../../api/order.api'
import { getAllProducts } from '../../api/product.api'
import Badge from '../../components/ui/Badge'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import StatCard from '../../components/ui/StatCard'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Announcement, Order, Product } from '../../types/index'

const DashboardHome = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard - ROVIKS'

    const fetchDashboardData = async () => {
      setIsLoading(true)

      try {
        const [ordersRes, productsRes, announcementsRes] = await Promise.all([
          getOrders(),
          getAllProducts(),
          getAnnouncements(),
        ])

        const ordersData = (ordersRes.data?.orders ?? ordersRes.data ?? []) as Order[]
        const productsData = (productsRes.data?.products ?? productsRes.data ?? []) as Product[]
        const announcementsData = (announcementsRes.data?.announcements ??
          announcementsRes.data ??
          []) as Announcement[]

        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setAnnouncements(Array.isArray(announcementsData) ? announcementsData : [])
      } catch {
        setOrders([])
        setProducts([])
        setAnnouncements([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDashboardData()
  }, [])

  const activeAnnouncement = useMemo(
    () => announcements.find((item) => item.isActive),
    [announcements],
  )

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders],
  )
  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === 'delivered').length,
    [orders],
  )
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  return (
    <div className="animate-[fadeIn_0.2s_ease]">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-foreground-muted">Your selling activity at a glance.</p>

      {activeAnnouncement ? (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-start gap-3 border-l-4 border-primary pl-3">
            <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{activeAnnouncement.title}</p>
              <p className="mt-1 text-sm text-foreground-secondary">{activeAnnouncement.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <LoadingSkeleton className="h-32" />
            <LoadingSkeleton className="h-32" />
            <LoadingSkeleton className="h-32" />
            <LoadingSkeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} />
            <StatCard icon={Clock} label="Pending" value={pendingCount} />
            <StatCard icon={CheckCircle} label="Delivered" value={deliveredCount} />
            <StatCard icon={Box} label="Products" value={products.length} />
          </>
        )}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <LoadingSkeleton className="h-12" />
              <LoadingSkeleton className="h-12" />
              <LoadingSkeleton className="h-12" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <Package className="h-12 w-12 text-zinc-600" />
              <p className="mt-4 text-foreground-muted">No orders yet.</p>
              <Link to="/catalog" className="mt-2 text-sm text-primary hover:underline">
                Browse the catalog
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-foreground-secondary">
                <thead className="bg-[#151515] text-xs uppercase tracking-wide text-foreground-muted">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-t border-border transition hover:bg-[#1f1f1f]">
                      <td className="px-4 py-3 text-foreground">{order.productId?.name ?? 'Product'}</td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Browse Catalog</h2>
          <Link to="/catalog" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-lg bg-surface-secondary" />
                  <div className="mt-2 h-3 w-20 rounded bg-surface-secondary" />
                </div>
              ))}
            </>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8 text-foreground-muted">
              No products available
            </div>
          ) : (
            products.slice(0, 6).map((product) => {
              const primaryImage =
                product.media.find((item) => item.type === 'image' && item.isPrimary)?.url ||
                product.media.find((item) => item.type === 'image')?.url

              return (
                <Link
                  key={product._id}
                  to={`/catalog/${product._id}`}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-surface-secondary transition hover:border-primary/50"
                >
                  <div className="aspect-square overflow-hidden bg-surface">
                    {primaryImage ? (
                      <img
                        src={getImageUrl(primaryImage)}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-foreground-muted">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary line-clamp-1">
                      {product.category?.name}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold uppercase leading-tight text-foreground">
                      {product.name}
                    </h3>
                    {product.contentType === 'product' && (
                      <p className="mt-2 text-sm font-bold text-foreground">₹{product.dropshipperPrice}</p>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardHome

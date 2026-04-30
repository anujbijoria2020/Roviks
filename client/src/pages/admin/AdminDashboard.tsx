import { Package, ShoppingBag, TrendingUp, Upload, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getStats,
  getAllDropshippers,
} from '../../api/admin.api'
import {
  getDesignKitPdfUrl,
  getWhatsappNumber,
  updateWhatsappNumber,
  uploadDesignKitPdf,
} from '../../api/settings.api'
import { getAllProducts } from '../../api/product.api'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import StatCard from '../../components/ui/StatCard'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Product, User } from '../../types/index'

interface AdminStats {
  totalProducts: number
  totalDropshippers: number
  ordersToday: number
  ordersThisMonth: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  ordersLast30Days: { date: string; count: number }[]
}

type TopProduct = Product & { orderCount?: number }
type TopDropshipper = User & { orderCount?: number }

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<TopProduct[]>([])
  const [dropshippers, setDropshippers] = useState<TopDropshipper[]>([])
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [designKitPdfUrl, setDesignKitPdfUrl] = useState('')
  const [designKitPdfFile, setDesignKitPdfFile] = useState<File | null>(null)
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false)
  const [isSavingDesignKitPdf, setIsSavingDesignKitPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = 'Admin Dashboard - ROVIKS'

    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const [statsRes, dropshippersRes, productsRes, whatsappRes, designKitRes] = await Promise.all([
          getStats(),
          getAllDropshippers(),
          getAllProducts(),
          getWhatsappNumber(),
          getDesignKitPdfUrl(),
        ])

        const statsData = (statsRes.data?.stats ?? statsRes.data ?? null) as AdminStats | null
        const dropshippersData = (dropshippersRes.data?.dropshippers ?? dropshippersRes.data ?? []) as TopDropshipper[]
        const productsData = (productsRes.data?.products ?? productsRes.data ?? []) as TopProduct[]

        setStats(statsData)
        setDropshippers(Array.isArray(dropshippersData) ? dropshippersData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setWhatsappNumber(
          whatsappRes.data?.value ??
            whatsappRes.data?.whatsappNumber ??
            whatsappRes.data?.settings?.value ??
            '',
        )
        setDesignKitPdfUrl(
          designKitRes.data?.value ??
            designKitRes.data?.designKitPdfUrl ??
            designKitRes.data?.settings?.value ??
            '',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDashboardData()
  }, [])

  const topProducts = useMemo(
    () => [...products].sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0)).slice(0, 5),
    [products],
  )
  const topDropshippers = useMemo(
    () => [...dropshippers].sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0)).slice(0, 5),
    [dropshippers],
  )

  const handleSaveWhatsapp = async () => {
    if (!whatsappNumber.trim()) return
    setIsSavingWhatsapp(true)
    try {
      await updateWhatsappNumber(whatsappNumber.trim())
      toast.success('WhatsApp number updated')
    } catch {
      toast.error('Unable to update WhatsApp number')
    } finally {
      setIsSavingWhatsapp(false)
    }
  }

  const handleSaveDesignKitPdf = async () => {
    if (!designKitPdfFile) return
    setIsSavingDesignKitPdf(true)
    try {
      await uploadDesignKitPdf(designKitPdfFile)
      toast.success('Design kit PDF uploaded')
      setDesignKitPdfFile(null)
    } catch {
      toast.error('Unable to upload design kit PDF')
    } finally {
      setIsSavingDesignKitPdf(false)
    }
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-white">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-1 text-zinc-400">Platform overview at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <LoadingSkeleton className="h-32" />
            <LoadingSkeleton className="h-32" />
            <LoadingSkeleton className="h-32" />
            <LoadingSkeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard icon={Package} label="Total Products" value={stats?.totalProducts ?? 0} />
            <StatCard icon={Users} label="Total Dropshippers" value={stats?.totalDropshippers ?? 0} />
            <StatCard icon={ShoppingBag} label="Orders Today" value={stats?.ordersToday ?? 0} />
            <StatCard icon={TrendingUp} label="Orders This Month" value={stats?.ordersThisMonth ?? 0} />
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          ['pending', stats?.pendingOrders ?? 0, 'text-yellow-500'],
          ['confirmed', stats?.confirmedOrders ?? 0, 'text-blue-500'],
          ['shipped', stats?.shippedOrders ?? 0, 'text-purple-500'],
          ['delivered', stats?.deliveredOrders ?? 0, 'text-green-500'],
          ['cancelled', stats?.cancelledOrders ?? 0, 'text-red-500'],
        ].map(([label, count, color]) => (
          <div key={String(label)} className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
        <h2 className="mb-4 font-semibold text-white">Orders Last 30 Days</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.ordersLast30Days ?? []}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #3f3f46', color: '#fff' }} />
              <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
          <h3 className="mb-4 font-semibold text-white">Top Products</h3>
          {topProducts.map((product) => {
            const image = product.media?.find((item) => item.type === 'image' && item.isPrimary)?.url
            return (
              <div key={product._id} className="flex items-center justify-between border-b border-zinc-800 py-2 last:border-0">
                <div className="flex items-center gap-2">
                  {image ? (
                    <img src={getImageUrl(image)} alt={product.name} className="h-8 w-8 rounded object-cover" onError={handleImageError} />
                  ) : (
                    <div className="h-8 w-8 rounded bg-zinc-800" />
                  )}
                  <p className="text-sm text-white">{product.name}</p>
                </div>
                <p className="font-medium text-orange-500">{product.orderCount ?? 0}</p>
              </div>
            )
          })}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
          <h3 className="mb-4 font-semibold text-white">Top Dropshippers</h3>
          {topDropshippers.map((dropshipper) => {
            const initials = (dropshipper.fullName?.[0] ?? 'D').toUpperCase()
            return (
              <div
                key={dropshipper._id}
                className="flex items-center justify-between border-b border-zinc-800 py-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-xs text-orange-500">
                    {initials}
                  </div>
                  <p className="text-sm text-white">{dropshipper.fullName}</p>
                </div>
                <p className="font-medium text-orange-500">{dropshipper.orderCount ?? 0}</p>
              </div>
            )
          })}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
        <h3 className="font-semibold text-white">WhatsApp Settings</h3>
        <p className="mt-2 text-sm text-zinc-400">Current number: {whatsappNumber || 'Not configured'}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="Enter WhatsApp number"
            className="min-w-[260px] flex-1 rounded-lg border border-zinc-800 bg-[#111111] px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={isSavingWhatsapp}
            onClick={() => void handleSaveWhatsapp()}
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
        <h3 className="font-semibold text-white">Launch Your Own Design PDF</h3>
        <p className="mt-2 text-sm text-zinc-400">Current PDF: {designKitPdfUrl || 'Not configured'}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex min-w-[260px] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 p-6 text-center transition hover:border-orange-500">
            <Upload className="mr-2 h-5 w-5 text-zinc-500" />
            <p className="text-zinc-500">{designKitPdfFile?.name ?? 'Click or drag PDF here'}</p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(event) => setDesignKitPdfFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            disabled={isSavingDesignKitPdf || !designKitPdfFile}
            onClick={() => void handleSaveDesignKitPdf()}
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Upload
          </button>
        </div>
        {designKitPdfUrl ? (
          <a
            href={designKitPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-medium text-[#F5A623] hover:underline"
          >
            Open current PDF
          </a>
        ) : null}
      </section>
    </div>
  )
}

export default AdminDashboard

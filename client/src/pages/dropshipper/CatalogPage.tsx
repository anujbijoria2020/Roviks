import { Download, Eye, Package, Rocket, Search, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllCategories, getAllProducts } from '../../api/product.api'
import { getDesignKitPdfUrl } from '../../api/settings.api'
import PageLoader from '../../components/PageLoader'
import PublicFooter from '../../components/PublicFooter'
import PublicNavbar from '../../components/PublicNavbar'
import OrderModal from '../../components/OrderModal'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Category, Product } from '../../types/index'

const skeletonCards = new Array(6).fill(null)

const CatalogPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'product' | 'mockup' | 'design'>('product')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [designKitPdfUrl, setDesignKitPdfUrl] = useState('')

  useEffect(() => {
    document.title = 'Product Catalog - ROVIKS'

    const fetchCategories = async () => {
      try {
        const response = await getAllCategories()
        const list = (response.data?.categories ?? response.data ?? []) as Category[]
        setCategories(Array.isArray(list) ? list : [])
      } catch {
        setCategories([])
      }
    }

    const fetchDesignKitPdf = async () => {
      try {
        const response = await getDesignKitPdfUrl()
        const url = response.data?.designKitPdfUrl ?? response.data?.value ?? ''
        setDesignKitPdfUrl(url)
      } catch {
        setDesignKitPdfUrl('')
      }
    }

    void fetchCategories()
    void fetchDesignKitPdf()
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await getAllProducts({
          search,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          contentType: activeTab,
          size: selectedSize !== 'all' ? selectedSize : undefined,
        })
        const list = (response.data?.products ?? response.data ?? []) as Product[]
        setProducts(Array.isArray(list) ? list : [])
      } catch {
        setProducts([])
      } finally {
        setIsLoading(false)
        setIsInitialLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [search, activeTab, selectedCategory, selectedSize])

  if (isInitialLoading) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <PublicNavbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-24">
        <div className="animate-[fadeIn_0.2s_ease] text-white">
          <h1 className="text-6xl font-black text-[#F5A623] uppercase">CATALOG</h1>
          <p className="mt-2 text-zinc-400">Browse products, mockups, and designs — all in one place.</p>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('product')
                setSelectedSize('all')
              }}
              className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition ${
                activeTab === 'product'
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-transparent border border-zinc-700 text-zinc-400 hover:border-[#F5A623] hover:text-[#F5A623]'
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('mockup')
                setSelectedSize('all')
              }}
              className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition ${
                activeTab === 'mockup'
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-transparent border border-zinc-700 text-zinc-400 hover:border-[#F5A623] hover:text-[#F5A623]'
              }`}
            >
              Mockups
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('design')
                setSelectedSize('all')
              }}
              className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition ${
                activeTab === 'design'
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-transparent border border-zinc-700 text-zinc-400 hover:border-[#F5A623] hover:text-[#F5A623]'
              }`}
            >
              Designs
            </button>
          </div>

          <div className="mt-6 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${activeTab}s...`}
                className="w-full rounded-xl border border-zinc-800 bg-[#1a1a1a] py-3 pl-10 pr-4 text-white placeholder-zinc-500 transition focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {designKitPdfUrl && (
            <div className="mt-6 rounded-xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-[#F5A623]" />
                  <div>
                    <h3 className="font-bold text-white">Launch Your Own Design</h3>
                    <p className="mt-1 text-sm text-zinc-400">Download our complete design kit to get started</p>
                  </div>
                </div>
                <a
                  href={designKitPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-[#F5A623] px-4 py-2.5 text-sm font-bold text-black transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-zinc-400">Category:</p>
            <div className="mt-2 flex w-full gap-2 overflow-x-auto whitespace-nowrap pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm transition ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 font-medium text-white'
                    : 'border border-zinc-700 bg-[#1a1a1a] text-zinc-400 hover:border-orange-500 hover:text-white'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm transition ${
                    selectedCategory === category.slug
                      ? 'bg-orange-500 font-medium text-white'
                      : 'border border-zinc-700 bg-[#1a1a1a] text-zinc-400 hover:border-orange-500 hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'product' && (
            <div className="mt-3">
              <p className="text-sm text-zinc-400">Size:</p>
              <div className="mt-2 flex w-full gap-2 overflow-x-auto whitespace-nowrap pb-2">
                {['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size.toLowerCase())}
                    className={`cursor-pointer rounded-full px-4 py-2 text-sm transition ${
                      selectedSize === size.toLowerCase()
                        ? 'bg-orange-500 font-medium text-white'
                        : 'border border-zinc-700 bg-[#1a1a1a] text-zinc-400 hover:border-orange-500 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              skeletonCards.map((_, index) => (
                <div key={index} className="animate-pulse rounded-xl bg-[#1a1a1a] p-4">
                  <div className="aspect-square rounded-lg bg-zinc-800" />
                  <div className="mt-4 h-3 w-20 rounded bg-zinc-800" />
                  <div className="mt-2 h-4 w-40 rounded bg-zinc-800" />
                  <div className="mt-3 h-4 w-28 rounded bg-zinc-800" />
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-zinc-600" />
                <p className="mt-4 text-lg text-zinc-500">No products found</p>
              </div>
            ) : (
              products.map((product) => {
                const primaryImage =
                  product.media.find((item) => item.type === 'image' && item.isPrimary)?.url ||
                  product.media.find((item) => item.type === 'image')?.url

                const isProduct = product.contentType === 'product'
                const isDownloadable = product.contentType === 'mockup' || product.contentType === 'design'

                return (
                  <article
                    key={product._id}
                    onClick={() => navigate(`/catalog/${product._id}`)}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-[#1a1a1a] transition hover:border-zinc-600"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#111111]">
                      {isDownloadable && (
                        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#F5A623]/20 px-2 py-1">
                          <Download className="h-3 w-3 text-[#F5A623]" />
                          <span className="text-xs font-medium text-[#F5A623]">Free Download</span>
                        </div>
                      )}

                      {primaryImage ? (
                        <img
                          src={getImageUrl(primaryImage)}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={handleImageError}
                        />
                      ) : (
                        <img
                          src={
                            product.contentType === 'mockup'
                              ? '/mockup.jpg'
                              : product.contentType === 'design'
                                ? '/design.jpg'
                                : '/tshirt.webp'
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(`/catalog/${product._id}`)
                          }}
                          className="rounded-full bg-white/10 p-3 transition hover:bg-orange-500"
                        >
                          <Eye className="h-5 w-5 text-white" />
                        </button>
                        {isProduct && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!user) {
                                toast.error('Please sign in to place orders')
                                navigate('/login')
                                return
                              }
                              setSelectedProduct(product)
                            }}
                            className="rounded-full bg-white/10 p-3 transition hover:bg-green-500"
                          >
                            <ShoppingBag className="h-5 w-5 text-white" />
                          </button>
                        )}
                        {isDownloadable && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!user) {
                                toast.error('Please sign in to download')
                                navigate('/login')
                                return
                              }
                              if (primaryImage) {
                                const link = document.createElement('a')
                                link.href = getImageUrl(primaryImage)
                                link.download = `${product.name.replace(/[^a-z0-9]/gi, '_')}.jpg`
                                link.click()
                              }
                            }}
                            className="rounded-full bg-white/10 p-3 transition hover:bg-green-500"
                          >
                            <Download className="h-5 w-5 text-white" />
                          </button>
                        )}
                      </div>

                      {isProduct && (
                        <div className="absolute right-3 top-3">
                          <Badge status={product.stockStatus} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-orange-500">
                        {product.category?.name}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold uppercase leading-tight text-white">
                        {product.name}
                      </h3>

                      {isProduct && (
                        <>
                          <div className="mt-3 flex items-center gap-3">
                            <p className="text-lg font-bold text-white">₹{product.dropshipperPrice}</p>
                            <p className="text-sm text-zinc-500 line-through">₹{product.mrp}</p>
                          </div>
                          <p className="mt-1 text-xs text-green-400">Earn ₹{product.profitMargin}/unit</p>
                        </>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>

        </div>
      </main>

      <PublicFooter />

      {selectedProduct ? (
        <OrderModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      ) : null}
    </div>
  )
}

export default CatalogPage

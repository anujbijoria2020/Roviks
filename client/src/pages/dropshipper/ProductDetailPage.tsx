import { Download, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductById, getSavedProducts, saveProduct, unsaveProduct } from '../../api/product.api'
import PageLoader from '../../components/PageLoader'
import PublicFooter from '../../components/PublicFooter'
import PublicNavbar from '../../components/PublicNavbar'
import OrderModal from '../../components/OrderModal'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Product } from '../../types/index'

const ProductDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const response = await getProductById(id)
        const item = (response.data?.product ?? response.data) as Product
        setProduct(item)
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProduct()
  }, [id])

  useEffect(() => {
    const fetchSavedState = async () => {
      if (!id || !user) {
        setIsSaved(false)
        return
      }
      try {
        const response = await getSavedProducts()
        const list = (response.data?.products ?? response.data ?? []) as Array<Product | { _id: string }>
        setIsSaved(Array.isArray(list) && list.some((item) => item._id === id))
      } catch {
        setIsSaved(false)
      }
    }

    void fetchSavedState()
  }, [id, user])

  const imageMedia = useMemo(
    () => product?.media?.filter((item) => item.type === 'image') ?? [],
    [product],
  )
  const videoMedia = useMemo(
    () => product?.media?.find((item) => item.type === 'video'),
    [product],
  )
  const selectedImageUrl = imageMedia[selectedImageIndex]?.url ?? imageMedia[0]?.url

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} - ROVIKS`
      return
    }

    document.title = 'Product - ROVIKS'
  }, [product?.name])

  const downloadAssets = async () => {
    if (!product) return
    if (!user) {
      toast.error('Please sign in to download assets')
      navigate('/login')
      return
    }

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const folder = zip.folder(product.name)

    for (let i = 0; i < product.media.length; i += 1) {
      const media = product.media[i]
      const response = await fetch(getImageUrl(media.url))
      const blob = await response.blob()
      const ext = media.type === 'video' ? 'mp4' : 'jpg'
      folder?.file(`${media.type}-${i + 1}.${ext}`, blob)
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product.name}-assets.zip`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Assets downloaded!')
  }

  const handleToggleSave = async () => {
    if (!product) return
    if (!user) {
      toast.error('Please sign in to save products')
      navigate('/login')
      return
    }

    try {
      if (isSaved) {
        await unsaveProduct(product._id)
        setIsSaved(false)
        toast.success('Product removed from saved list')
      } else {
        await saveProduct(product._id)
        setIsSaved(true)
        toast.success('Product saved')
      }
    } catch {
      toast.error('Unable to update saved product')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <PublicNavbar />
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 text-zinc-400">Product not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl animate-[fadeIn_0.2s_ease] px-6 pb-16 pt-24">
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="text-zinc-400 transition hover:text-white"
        >
          ← Back to Catalog
        </button>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="aspect-square overflow-hidden rounded-xl bg-[#1a1a1a]">
              {selectedImageUrl ? (
                <img src={getImageUrl(selectedImageUrl)} alt={product.name} className="h-full w-full object-cover" onError={handleImageError} />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">No image</div>
              )}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto">
              {imageMedia.map((item, index) => (
                <button
                  type="button"
                  key={`${item.url}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImageIndex === index ? 'border-orange-500' : 'border-zinc-800'
                  }`}
                >
                  <img src={getImageUrl(item.url)} alt={`Thumb ${index + 1}`} className="h-full w-full object-cover" onError={handleImageError} />
                </button>
              ))}
            </div>

            {videoMedia ? (
              <div className="mt-4">
                <p className="mb-2 text-sm text-zinc-400">Product Video</p>
                <video controls className="w-full rounded-xl bg-[#1a1a1a]">
                  <source src={getImageUrl(videoMedia.url)} />
                </video>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void downloadAssets()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-6 py-3 text-white transition hover:border-orange-500"
            >
              <Download className="h-4 w-4" />
              Download All Assets
            </button>
          </section>

          <section className="lg:col-span-2">
            <Badge status={product.category?.name ?? 'category'} />

            <h1 className="mt-2 text-2xl font-black uppercase text-white">{product.name}</h1>

            {product.contentType === 'product' ? (
              <>
                <div className="mt-4 rounded-xl bg-[#1a1a1a] p-4">
                  <div className="flex items-end">
                    <p className="text-3xl font-bold text-white">₹{product.dropshipperPrice}</p>
                    <p className="ml-3 text-lg text-zinc-500 line-through">₹{product.mrp}</p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-green-400">Earn ₹{product.profitMargin} per unit</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'MOQ', value: product.moq },
                    { label: 'Weight', value: product.weight || '-' },
                    { label: 'Dimensions', value: product.dimensions || '-' },
                    { label: 'Material', value: product.material || '-' },
                    { label: 'Stock Status', value: product.stockStatus.replaceAll('_', ' ') },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-[#111111] p-3">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-zinc-400">Description</p>
                  <p className="text-sm leading-relaxed text-zinc-300">{product.description}</p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setShowAuthPrompt(true)
                        return
                      }
                      setIsOrderModalOpen(true)
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-bold text-white transition hover:bg-[#22c55e]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Place Order via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleSave()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 text-zinc-400 transition hover:border-orange-500 hover:text-orange-500"
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved Product' : 'Save Product'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-6">
                  <h2 className="text-xl font-black uppercase text-[#F5A623]">FREE DOWNLOAD</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Use this {product.contentType === 'mockup' ? 'mockup' : 'design'} for your store, social media, or any marketing material.
                  </p>

                  <button
                    type="button"
                    onClick={() => void downloadAssets()}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-4 font-bold text-black transition hover:bg-[#e6951a]"
                  >
                    <Download className="h-5 w-5" />
                    Download All Files (ZIP)
                  </button>

                  {selectedImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          toast.error('Please sign in to download')
                          navigate('/login')
                          return
                        }
                        const link = document.createElement('a')
                        link.href = getImageUrl(selectedImageUrl)
                        link.download = `${product.name.replace(/[^a-z0-9]/gi, '_')}.jpg`
                        link.click()
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 text-white transition hover:border-orange-500"
                    >
                      <Download className="h-4 w-4" />
                      Download Primary Image
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-zinc-400">Suitable for:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Instagram Post', 'WhatsApp Status', 'Facebook Ad', 'Product Listing'].map((tag) => (
                      <span key={tag} className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-zinc-400">Description</p>
                  <p className="text-sm leading-relaxed text-zinc-300">{product.description}</p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <PublicFooter />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
      />

      {showAuthPrompt ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-[#111111] p-6">
            <h2 className="text-lg font-semibold text-white">Sign in to place orders</h2>
            <p className="mt-2 text-sm text-zinc-400">
              You need an account to place order requests via WhatsApp.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-bold text-black"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200"
              >
                Register
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowAuthPrompt(false)}
              className="mt-3 w-full text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProductDetailPage

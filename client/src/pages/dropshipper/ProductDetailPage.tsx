import { Download, ExternalLink, Heart, MessageCircle, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductById, getSavedProducts, saveProduct, unsaveProduct } from '../../api/product.api'
import { pushToShopify } from '../../api/shopify.api'
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
  const [isPushing, setIsPushing] = useState(false)
  const [pushedUrl, setPushedUrl] = useState<string | null>(null)

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

  const handlePushToShopify = async () => {
    setIsPushing(true)
    try {
      const res = await pushToShopify(product._id)
      setPushedUrl(res.data.productUrl)
      toast.success('Product pushed to Shopify! 🎉')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to push. Check Shopify connection in Settings.')
    } finally {
      setIsPushing(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PublicNavbar />
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 text-foreground-muted">Product not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl animate-[fadeIn_0.2s_ease] px-6 pb-16 pt-24">
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="text-foreground-muted transition hover:text-foreground"
        >
          ← Back to Catalog
        </button>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="aspect-square overflow-hidden rounded-xl bg-surface-secondary">
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
                    selectedImageIndex === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={getImageUrl(item.url)} alt={`Thumb ${index + 1}`} className="h-full w-full object-cover" onError={handleImageError} />
                </button>
              ))}
            </div>

            {videoMedia ? (
              <div className="mt-4">
                <p className="mb-2 text-sm text-foreground-muted">Product Video</p>
                <video controls className="w-full rounded-xl bg-surface-secondary">
                  <source src={getImageUrl(videoMedia.url)} />
                </video>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void downloadAssets()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-6 py-3 text-foreground transition hover:border-primary"
            >
              <Download className="h-4 w-4" />
              Download All Assets
            </button>
          </section>

          <section className="lg:col-span-2">
            <Badge status={product.category?.name ?? 'category'} />

            <h1 className="mt-2 text-2xl font-black uppercase text-foreground">{product.name}</h1>

            {product.contentType === 'product' ? (
              <>
                <div className="mt-4 rounded-xl bg-surface-secondary p-4">
                  <div className="flex items-end">
                    <p className="text-3xl font-bold text-foreground">₹{product.dropshipperPrice}</p>
                    <p className="ml-3 text-lg text-foreground-muted line-through">₹{product.mrp}</p>
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
                    <div key={item.label} className="rounded-lg bg-surface p-3">
                      <p className="text-xs uppercase tracking-wider text-foreground-muted">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-foreground-muted">Description</p>
                  <p className="text-sm leading-relaxed text-foreground-secondary">{product.description}</p>
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-bold text-foreground transition hover:bg-[#22c55e]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Place Order via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleSave()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-foreground-muted transition hover:border-primary hover:text-primary"
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved Product' : 'Save Product'}
                  </button>

                  {user?.shopify?.isConnected && user?.shopify?.status === 'active' ? (
                    <div>
                      <button
                        type="button"
                        onClick={handlePushToShopify}
                        disabled={isPushing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#96BF48] py-3 font-bold text-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPushing ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <ShoppingBag className="h-5 w-5" />
                            Add to Shopify Store
                          </>
                        )}
                      </button>
                      {pushedUrl && (
                        <a
                          href={pushedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center justify-center gap-1 text-xs text-[#96BF48] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View on Shopify Store →
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/profile')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-foreground-muted transition hover:border-[#96BF48] hover:text-[#96BF48]"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Connect Shopify to push products
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 rounded-2xl border border-border bg-surface-secondary p-6">
                  <h2 className="text-xl font-black uppercase text-primary">FREE DOWNLOAD</h2>
                  <p className="mt-2 text-sm text-foreground-muted">
                    Use this {product.contentType === 'mockup' ? 'mockup' : 'design'} for your store, social media, or any marketing material.
                  </p>

                  <button
                    type="button"
                    onClick={() => void downloadAssets()}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground transition hover:bg-[#e6951a]"
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
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-foreground transition hover:border-primary"
                    >
                      <Download className="h-4 w-4" />
                      Download Primary Image
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-foreground-muted">Suitable for:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Instagram Post', 'WhatsApp Status', 'Facebook Ad', 'Product Listing'].map((tag) => (
                      <span key={tag} className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-foreground-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm text-foreground-muted">Description</p>
                  <p className="text-sm leading-relaxed text-foreground-secondary">{product.description}</p>
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
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Sign in to place orders</h2>
            <p className="mt-2 text-sm text-foreground-muted">
              You need an account to place order requests via WhatsApp.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-semibold text-foreground-secondary"
              >
                Register
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowAuthPrompt(false)}
              className="mt-3 w-full text-sm text-foreground-muted transition hover:text-foreground-secondary"
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

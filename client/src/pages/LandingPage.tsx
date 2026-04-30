import { ChevronDown, Download, Rocket, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCategories, getAllProducts } from '../api/product.api'
import { getDesignKitPdfUrl } from '../api/settings.api'
import PublicFooter from '../components/PublicFooter'
import PublicNavbar from '../components/PublicNavbar'
import { CATALOG_CATEGORY_CARDS } from '../constants/catalogCategories'
import { getImageUrl, handleImageError } from '../utils/imageUrl'
import type { Category, Product } from '../types'

const CARD_BG_BY_SLUG: Record<string, string> = {
  products: `${import.meta.env.BASE_URL}tshirt.webp`,
  mockups: `${import.meta.env.BASE_URL}mockup.jpg`,
  designs: `${import.meta.env.BASE_URL}design.jpg`,
}

const CARD_OVERLAY_BY_SLUG: Record<string, string> = {
  products: 'from-amber-500/35 via-transparent to-transparent',
  mockups: 'from-slate-400/30 via-transparent to-transparent',
  designs: 'from-emerald-500/35 via-transparent to-transparent',
}

const FALLBACK_IMAGE_BY_CONTENT_TYPE: Record<string, string> = {
  product: CARD_BG_BY_SLUG.products,
  products: CARD_BG_BY_SLUG.products,
  mockup: CARD_BG_BY_SLUG.mockups,
  mockups: CARD_BG_BY_SLUG.mockups,
  design: CARD_BG_BY_SLUG.designs,
  designs: CARD_BG_BY_SLUG.designs,
}

const LandingPage = () => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [designKitPdfUrl, setDesignKitPdfUrl] = useState('')
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)

  useEffect(() => {
    document.title = 'ROVIKS - Start Your Clothing Business'

    const fetchFeaturedProducts = async () => {
      setIsLoadingFeatured(true)
      try {
        const [categoriesResponse, productsResponse, designKitRes] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
          getDesignKitPdfUrl(),
        ])
        const allCategories = (categoriesResponse.data?.categories ?? categoriesResponse.data ?? []) as Category[]
        const allProducts = (productsResponse.data?.products ?? productsResponse.data ?? []) as Product[]
        setCategories(Array.isArray(allCategories) ? allCategories : [])
        setDesignKitPdfUrl(
          designKitRes.data?.value ??
            designKitRes.data?.designKitPdfUrl ??
            designKitRes.data?.settings?.value ??
            '',
        )
        const activeProducts = Array.isArray(allProducts)
          ? allProducts.filter((item) => item.isActive)
          : []
        setFeaturedProducts(activeProducts.slice(0, 3))
      } catch {
        setFeaturedProducts([])
      } finally {
        setIsLoadingFeatured(false)
      }
    }

    void fetchFeaturedProducts()
  }, [])

  const categoryCards = useMemo(
    () =>
      CATALOG_CATEGORY_CARDS.map((card) => ({
        ...card,
        categoryExists: categories.some((category) => category.slug === card.slug),
      })),
    [categories],
  )

  return (
    <div className="min-h-screen animate-[fadeIn_0.2s_ease] bg-[#0D0D0D] text-white">
      <PublicNavbar />

      <main>
        <section className="relative flex min-h-screen items-center justify-center bg-[#111111] px-8 pb-20 pt-24 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,166,35,0.05)_0%,transparent_60%)]" />
          <div>
            <h1 className="text-4xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
              <span className="block text-white">Start Your</span>
              <span className="block text-white">Clothing Business</span>
              <span className="block text-[#F5A623]">Without</span>
              <span className="block text-[#F5A623]">Inventory</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-center text-lg text-zinc-400">
              Download product images, videos, mockups, and designs to start selling fashion online.
              No inventory needed.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/start-selling')}
                className="rounded-xl bg-[#F5A623] px-8 py-4 font-bold text-black transition hover:opacity-90"
              >
                Start Selling →
              </button>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="rounded-xl border border-zinc-600 px-8 py-4 text-white transition hover:border-[#F5A623] hover:text-[#F5A623]"
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-600">
            <ChevronDown className="h-7 w-7" />
          </div>
        </section>

        <section className="bg-[#0D0D0D] px-8 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 overflow-hidden rounded-3xl border border-zinc-800 bg-[#141414]">
              <div className="relative grid grid-cols-1 gap-0 md:grid-cols-2">
                <div
                  className="min-h-[260px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${CARD_BG_BY_SLUG.designs})` }}
                >
                  <div className="h-full bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
                </div>

                <div className="flex flex-col justify-center p-8 md:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">
                    Dropshipper Resource
                  </p>
                  <h2 className="mt-3 text-3xl font-black uppercase leading-none text-white sm:text-4xl">
                    Launch Your Own Design
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                    Access the full design kit PDF with products, color options, size details, and ready-to-sell references in one place.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                    <li>Complete product + color combinations</li>
                    <li>Size and variant overview</li>
                    <li>Quick reference for selling flow</li>
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={designKitPdfUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!designKitPdfUrl}
                      className="rounded-full bg-[#F5A623] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-black transition hover:opacity-90 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    >
                      Open Design Kit PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => navigate('/contact')}
                      className="rounded-full border border-zinc-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-[#F5A623] hover:text-[#F5A623]"
                    >
                      Need help?
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black uppercase leading-none sm:text-6xl">
                <span className="text-white">Browse By</span> <span className="text-[#F5A623]">Content Type</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                Products, mockups, and designs are shown as separate cards on the landing page.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryCards.map((item) => {
                const Icon = item.icon
                return (
                  <article
                    key={item.slug}
                    className="group relative min-h-[22rem] overflow-hidden rounded-3xl border border-zinc-700/70 bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-[#F5A623]/60"
                  >
                    <img
                      src={CARD_BG_BY_SLUG[item.slug] ?? CARD_BG_BY_SLUG.products}
                      alt={`${item.title} preview`}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${CARD_OVERLAY_BY_SLUG[item.slug] ?? CARD_OVERLAY_BY_SLUG.products}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />

                    <div className="relative flex h-full flex-col justify-between p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full border border-white/30 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                          {item.title}
                        </span>
                        <div className="inline-flex rounded-xl border border-white/25 bg-black/30 p-3 text-[#F5A623] backdrop-blur-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-3xl font-black uppercase leading-none text-white">{item.title}</h3>
                        <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-zinc-200">{item.description}</p>
                        <button
                          type="button"
                          onClick={() => navigate(`/catalog?category=${item.slug}`)}
                          className="mt-5 rounded-full border border-[#F5A623]/70 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#F5A623] transition hover:bg-[#F5A623] hover:text-black"
                        >
                          Browse {item.title}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#111111] px-8 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black uppercase leading-none md:text-5xl">
                <span className="text-white">How It</span> <span className="text-[#F5A623]">Works</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Browse Content',
                  description:
                    'Explore our curated collection of product images, videos, mockups, and designs.',
                  icon: <ShoppingBag className="h-16 w-16 rounded-2xl bg-[#F5A623]/20 p-4 text-[#F5A623]" />,
                },
                {
                  step: '02',
                  title: 'Download Files',
                  description:
                    'Download high-quality ready-to-sell content instantly. No watermarks.',
                  icon: <Download className="h-16 w-16 rounded-2xl bg-[#F5A623]/20 p-4 text-[#F5A623]" />,
                },
                {
                  step: '03',
                  title: 'Start Selling',
                  description:
                    'Use the content to sell fashion on Instagram, WhatsApp, or any marketplace.',
                  icon: <Rocket className="h-16 w-16 rounded-2xl bg-[#F5A623]/20 p-4 text-[#F5A623]" />,
                },
              ].map((item) => (
                <article
                  key={item.step}
                  className="relative rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-10 text-center transition hover:border-zinc-600"
                >
                  <p className="absolute right-6 top-6 text-6xl font-black text-[#F5A623]/30">{item.step}</p>
                  <div className="mt-8 flex justify-center">{item.icon}</div>
                  <h3 className="mt-4 text-xl font-black uppercase text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0D0D0D] px-8 py-20">
          <div className="mx-auto mb-10 flex w-full max-w-7xl flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-black uppercase leading-none md:text-5xl">
              <span className="text-white">Featured</span> <span className="text-[#F5A623]">Products</span>
            </h2>
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="text-sm font-medium text-[#F5A623] transition hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingFeatured
              ? new Array(3).fill(null).map((_, index) => (
                  <div key={index} className="animate-pulse overflow-hidden rounded-2xl bg-[#111111]">
                    <div className="aspect-[4/5] bg-zinc-900" />
                    <div className="p-4">
                      <div className="h-5 w-2/3 rounded bg-zinc-800" />
                    </div>
                  </div>
                ))
              : featuredProducts.map((product) => {
                  const primaryImage =
                    product.media.find((item) => item.type === 'image' && item.isPrimary)?.url ||
                    product.media.find((item) => item.type === 'image')?.url

                  const hasValidImage = primaryImage && primaryImage.trim() !== ''

                  console.log('Product:', product.name, 'contentType:', product.contentType, 'hasValidImage:', hasValidImage, 'primaryImage:', primaryImage)

                  return (
                    <article
                      key={product._id}
                      onClick={() => navigate(`/catalog/${product._id}`)}
                      className="cursor-pointer overflow-hidden rounded-2xl bg-[#111111] transition duration-300 hover:scale-[1.02]"
                    >
                      <div className="relative aspect-[4/5] bg-zinc-900">
                        {hasValidImage ? (
                          <img src={getImageUrl(primaryImage)} alt={product.name} className="h-full w-full object-cover" onError={handleImageError} />
                        ) : (
                          <img
                            src={
                              FALLBACK_IMAGE_BY_CONTENT_TYPE[
                                (product.contentType ?? '').toString().toLowerCase()
                              ] ?? CARD_BG_BY_SLUG.products
                            }
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.log('Placeholder image failed to load:', e.currentTarget.src)
                            }}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-black uppercase leading-tight tracking-wide text-white">
                          {product.name}
                        </h3>
                      </div>
                    </article>
                  )
                })}
          </div>
        </section>

        <section className="bg-[#111111] px-8 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black uppercase leading-none md:text-5xl">
                <span className="text-white">Why</span> <span className="text-[#F5A623]">Roviks?</span>
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: '500+', label: 'Products Available' },
                { value: '0', label: 'Inventory Needed' },
                { value: '24/7', label: 'Content Access' },
                { value: '100%', label: 'Ready to Sell' },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8 text-center"
                >
                  <p className="text-5xl font-black text-[#F5A623]">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-wider text-zinc-400">{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F5A623] px-8 py-20 text-center">
          <h2 className="text-3xl font-black uppercase leading-none text-black sm:text-5xl">
            <span className="block">Ready To Start</span>
            <span className="block">Your Business?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-black/70">
            Join hundreds of dropshippers already selling with ROVIKS.
          </p>

          <button
            type="button"
            onClick={() => navigate('/register')}
            className="mt-8 rounded-xl bg-black px-10 py-4 font-bold text-white transition hover:bg-zinc-900"
          >
            Get Started Free →
          </button>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

export default LandingPage

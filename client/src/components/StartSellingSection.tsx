import { Layers, Palette, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type StartSellingSectionProps = {
  className?: string
  withTopPadding?: boolean
}

const cardBaseClass =
  'group relative h-56 cursor-pointer overflow-hidden rounded-2xl transition duration-300 hover:scale-[1.02] sm:h-72'

const CARD_BG_BY_SLUG: Record<'products' | 'mockups' | 'designs', string> = {
  products: `${import.meta.env.BASE_URL}tshirt.webp`,
  mockups: `${import.meta.env.BASE_URL}mockup.jpg`,
  designs: `${import.meta.env.BASE_URL}design.jpg`,
}

const CARD_OVERLAYS: Record<'products' | 'mockups' | 'designs', string> = {
  products: 'from-amber-500/35 via-transparent to-transparent',
  mockups: 'from-slate-400/30 via-transparent to-transparent',
  designs: 'from-emerald-500/35 via-transparent to-transparent',
}

const START_SELLING_CARDS = [
  {
    slug: 'products' as const,
    title: 'Products',
    description: 'Download product images and videos ready to post on your store or social media.',
    href: '/catalog',
    cta: 'Browse Products',
    icon: ShoppingBag,
  },
  {
    slug: 'mockups' as const,
    title: 'Mockups',
    description: 'Blank apparel mockup templates to showcase your designs professionally.',
    href: '/catalog?category=mockups',
    cta: 'Browse Mockups',
    icon: Layers,
  },
  {
    slug: 'designs' as const,
    title: 'Designs',
    description: 'Print-ready graphic designs for t-shirts, hoodies, and more.',
    href: '/catalog?category=designs',
    cta: 'Browse Designs',
    icon: Palette,
  },
]

const StartSellingSection = ({ className = '', withTopPadding = true }: StartSellingSectionProps) => {
  const navigate = useNavigate()

  return (
    <section className={`bg-[#0D0D0D] ${withTopPadding ? 'pt-20' : 'pt-8'} pb-20 px-8 ${className}`}>
      <div className="mx-auto w-full max-w-6xl text-center">
        <h2 className="text-4xl font-black uppercase leading-none sm:text-6xl">
          <span className="text-white">Start</span> <span className="text-[#F5A623]">Selling</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          Choose a category below to browse and download content for your clothing business.
        </p>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {START_SELLING_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.slug}
              className={`${cardBaseClass} border border-zinc-700/70 bg-zinc-900 hover:-translate-y-1 hover:border-[#F5A623]/60`}
              onClick={() => navigate(card.href)}
            >
              <img
                src={CARD_BG_BY_SLUG[card.slug]}
                alt={`${card.title} preview`}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${CARD_OVERLAYS[card.slug]}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-white/30 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                    {card.title}
                  </span>
                  <div className="inline-flex rounded-xl border border-white/25 bg-black/30 p-3 text-[#F5A623] backdrop-blur-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-black uppercase leading-none text-white">{card.title}</h3>
                  <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-zinc-200">{card.description}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(card.href)
                    }}
                    className="mt-5 rounded-full border border-[#F5A623]/70 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#F5A623] transition hover:bg-[#F5A623] hover:text-black"
                  >
                    {card.cta}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default StartSellingSection

import { Layers, Package, Palette } from 'lucide-react'

export const CATALOG_CATEGORY_CARDS = [
  {
    slug: 'products',
    title: 'Products',
    description: 'Ready-to-sell apparel listings with image sets and optional product videos.',
    accent: 'from-orange-500/25 to-orange-500/5',
    icon: Package,
  },
  {
    slug: 'mockups',
    title: 'Mockups',
    description: 'Presentation-ready apparel mockups for social media, stores, and client previews.',
    accent: 'from-zinc-200/15 to-zinc-200/5',
    icon: Layers,
  },
  {
    slug: 'designs',
    title: 'Designs',
    description: 'Sticker, print, and artwork images only for clean design asset downloads.',
    accent: 'from-emerald-500/25 to-emerald-500/5',
    icon: Palette,
  },
] as const

export type CatalogCategoryKind = 'products' | 'mockups' | 'designs'

export interface CatalogCategoryDefinition {
  name: string
  slug: string
  kind: CatalogCategoryKind
  sortOrder: number
}

export const CATALOG_CATEGORY_DEFINITIONS: CatalogCategoryDefinition[] = [
  { name: 'Products', slug: 'products', kind: 'products', sortOrder: 1 },
  { name: 'Mockups', slug: 'mockups', kind: 'mockups', sortOrder: 2 },
  { name: 'Designs', slug: 'designs', kind: 'designs', sortOrder: 3 },
]

const normalizeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

export const getCanonicalCategoryDefinition = (value: string) =>
  CATALOG_CATEGORY_DEFINITIONS.find(
    (definition) => definition.slug === normalizeLabel(value) || definition.name.toLowerCase() === value.trim().toLowerCase(),
  )

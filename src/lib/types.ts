export interface NavLink {
  id: string
  label: string
  href: string
}

export interface HeroSlide {
  id: string
  badge: string
  title: string
  subtitle: string
  cta1Label: string
  cta2Label: string
  backgroundImage: string
}

/** @deprecated usa heroSlides[] */
export type HeroData = HeroSlide

export interface NavbarData {
  brandName: string
  links: NavLink[]
}

// ── Category hierarchy ───────────────────────────────────────────────────────

export interface WatchModel {
  id: string
  name: string
}

export interface WatchCollection {
  id: string
  name: string
  models: WatchModel[]
}

export interface WatchBrand {
  id: string
  name: string
  collections: WatchCollection[]
}

export interface ProductCategory {
  brandId: string
  collectionId: string
  modelId: string
}

// ── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  sku: string
  slug: string
  brand: string
  name: string
  price: number
  salePrice?: number
  image: string
  images?: string[]
  tags?: string[]
  bestSeller?: boolean
  category: ProductCategory
  description: string
}

export interface FooterData {
  brandName: string
  links: NavLink[]
  copyright: string
}

export interface BentoItem {
  id: string
  title: string
  description?: string
  linkLabel: string
  src: string
  large: boolean
}

export interface FeatureBadge {
  id: string
  icon: string
  title: string
  description: string
}

export interface BrandShortcut {
  id: string
  name: string
  image: string
  link: string
}

export interface SiteData {
  navbar: NavbarData
  announcements?: string[]
  hero: HeroSlide
  heroSlides: HeroSlide[]
  bentoItems: BentoItem[]
  featureBadges?: FeatureBadge[]
  brandShortcuts?: BrandShortcut[]
  products: Product[]
  watchBrands: WatchBrand[]
  footer: FooterData
}

export interface CartItem extends Product {
  quantity: number
}

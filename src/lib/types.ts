export interface NavLink {
  id: string
  label: string
  href: string
}

export interface HeroData {
  badge: string
  title: string
  subtitle: string
  cta1Label: string
  cta2Label: string
  backgroundImage: string
}

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
  category: ProductCategory
  description: string
}

export interface FooterData {
  brandName: string
  links: NavLink[]
  copyright: string
}

export interface SiteData {
  navbar: NavbarData
  hero: HeroData
  products: Product[]
  watchBrands: WatchBrand[]
  footer: FooterData
}

export interface CartItem extends Product {
  quantity: number
}

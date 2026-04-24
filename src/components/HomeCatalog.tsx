'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { toastAddedToCart } from '@/lib/toast'
import type { Product, WatchBrand } from '@/lib/types'

interface Props {
  products: Product[]
  watchBrands: WatchBrand[]
}

const PRICE_RANGES = [
  { label: 'Hasta ₲200.000', min: 0, max: 200_000 },
  { label: '₲200k – ₲500k', min: 200_000, max: 500_000 },
  { label: '₲500k – ₲1M', min: 500_000, max: 1_000_000 },
  { label: 'Más de ₲1M', min: 1_000_000, max: Infinity },
]

export default function HomeCatalog({ products, watchBrands }: Props) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand))
    return Array.from(set).sort()
  }, [products])

  const collections = useMemo(() => {
    const result: { id: string; name: string }[] = []
    for (const wb of watchBrands) {
      if (selectedBrands.length > 0 && !selectedBrands.includes(wb.name)) continue
      for (const col of wb.collections) {
        if (products.some(p => p.category.collectionId === col.id)) {
          result.push({ id: col.id, name: col.name })
        }
      }
    }
    return result
  }, [watchBrands, selectedBrands, products])

  const isFiltered = selectedBrands.length > 0 || selectedCollections.length > 0 || selectedPriceRange !== null

  const filteredProducts = useMemo(() => {
    let list = [...products]
    if (selectedBrands.length > 0) list = list.filter(p => selectedBrands.includes(p.brand))
    if (selectedCollections.length > 0) list = list.filter(p => selectedCollections.includes(p.category.collectionId))
    if (selectedPriceRange !== null) {
      const r = PRICE_RANGES[selectedPriceRange]
      list = list.filter(p => {
        const price = p.salePrice ?? p.price
        return price >= r.min && price <= r.max
      })
    }
    return list
  }, [products, selectedBrands, selectedCollections, selectedPriceRange])

  // Brand groups for when no filter is active
  const brandGroups = useMemo(() =>
    watchBrands
      .map(wb => ({
        brandId: wb.id,
        brandName: wb.name,
        products: products.filter(p => p.category.brandId === wb.id),
      }))
      .filter(g => g.products.length > 0),
    [watchBrands, products]
  )

  const clearFilters = () => {
    setSelectedBrands([])
    setSelectedCollections([])
    setSelectedPriceRange(null)
  }

  const toggleBrand = (b: string) =>
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])

  const toggleCollection = (id: string) =>
    setSelectedCollections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const activeCount = selectedBrands.length + selectedCollections.length + (selectedPriceRange !== null ? 1 : 0)

  return (
    <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-16 border-t border-white/5">

      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-label-caps text-[9px] tracking-[0.3em] text-white/25 mb-2">CATÁLOGO COMPLETO</p>
          <h2 className="font-label-caps text-[18px] tracking-[0.1em] text-white font-light">
            TODOS LOS RELOJES
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="font-label-caps text-[9px] tracking-[0.18em] text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors border-b border-[#D4AF37]/30 pb-0.5"
            >
              LIMPIAR ({activeCount})
            </button>
          )}
          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-white/10 font-label-caps text-[9px] tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>tune</span>
            FILTROS {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar ── */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-none`}>
          <div className="sticky top-24 space-y-0 border border-white/[0.06] bg-[#0d0d0d]">

            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="font-label-caps text-[9px] tracking-[0.25em] text-white/35">FILTRAR</p>
            </div>

            {/* Marcas */}
            <FilterBlock title="MARCA">
              {brands.map(brand => (
                <CheckRow
                  key={brand}
                  label={brand}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                />
              ))}
            </FilterBlock>

            {/* Colecciones */}
            {collections.length > 0 && (
              <FilterBlock title="COLECCIÓN">
                {collections.map(col => (
                  <CheckRow
                    key={col.id}
                    label={col.name}
                    checked={selectedCollections.includes(col.id)}
                    onChange={() => toggleCollection(col.id)}
                  />
                ))}
              </FilterBlock>
            )}

            {/* Precio */}
            <FilterBlock title="PRECIO" last>
              {PRICE_RANGES.map((r, i) => (
                <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                    className={`w-3.5 h-3.5 rounded-full border flex-none flex items-center justify-center transition-colors cursor-pointer ${
                      selectedPriceRange === i ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {selectedPriceRange === i && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                  </div>
                  <span
                    onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                    className={`text-[11px] font-light cursor-pointer transition-colors ${
                      selectedPriceRange === i ? 'text-white' : 'text-white/35 group-hover:text-white/60'
                    }`}
                  >
                    {r.label}
                  </span>
                </label>
              ))}
            </FilterBlock>
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          {isFiltered ? (
            /* Filtered flat grid */
            filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <span className="material-symbols-outlined text-white/10" style={{ fontSize: 44 }}>search_off</span>
                <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/20">SIN RESULTADOS</p>
                <button onClick={clearFilters} className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/40 pb-0.5">
                  LIMPIAR FILTROS
                </button>
              </div>
            ) : (
              <div>
                <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/25 mb-8">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'PIEZA' : 'PIEZAS'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-5">
                  {filteredProducts.map(p => <CatalogCard key={p.id} product={p} />)}
                </div>
              </div>
            )
          ) : (
            /* Default brand sections */
            <div className="space-y-12">
              {brandGroups.map(g => (
                <div key={g.brandId}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-label-caps text-[13px] tracking-[0.15em] text-white/70">{g.brandName}</h3>
                    {g.products.length > 5 && (
                      <Link
                        href={`/brand/${g.brandId}`}
                        className="flex items-center gap-1.5 group pb-0.5 border-b border-white/10 hover:border-[#D4AF37]/40 transition-colors"
                      >
                        <span className="font-label-caps text-[8px] tracking-[0.2em] text-white/25 group-hover:text-[#D4AF37] transition-colors">VER TODO</span>
                        <span className="material-symbols-outlined text-white/20 group-hover:text-[#D4AF37] transition-colors" style={{ fontSize: 11 }}>arrow_forward</span>
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-y-10 gap-x-5">
                    {g.products.slice(0, 5).map(p => <CatalogCard key={p.id} product={p} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FilterBlock({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`px-5 py-4 ${!last ? 'border-b border-white/[0.06]' : ''}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-3 group">
        <span className="font-label-caps text-[8px] tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors">{title}</span>
        <span className={`material-symbols-outlined text-white/15 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ fontSize: 13 }}>expand_more</span>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group" onClick={onChange}>
      <div className={`w-3.5 h-3.5 border flex-none flex items-center justify-center transition-colors ${
        checked ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20 group-hover:border-white/40'
      }`}>
        {checked && <span className="material-symbols-outlined text-[#0A0A0A]" style={{ fontSize: 10 }}>check</span>}
      </div>
      <span className={`text-[11px] font-light transition-colors ${checked ? 'text-white' : 'text-white/35 group-hover:text-white/60'}`}>
        {label}
      </span>
    </label>
  )
}

function CatalogCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [bounce, setBounce] = useState(false)

  const hasOffer = product.salePrice != null && product.salePrice < product.price
  const displayPrice = hasOffer ? product.salePrice! : product.price
  const favorited = isFavorite(product.id)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    addItem(product); toastAddedToCart(product.name)
    setBounce(true); setTimeout(() => setBounce(false), 600)
  }

  function handleFav(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-4 border border-white/5 group-hover:border-[#D4AF37]/15 transition-colors duration-500">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true">
          <Image src={product.image} alt={product.name} fill
            className={`object-cover transition-all duration-500 ease-out ${product.images?.[0] ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]'}`}
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw" unoptimized={product.image.startsWith('/uploads/')} />
          {product.images?.[0] && (
            <Image src={product.images[0]} alt={product.name} fill
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
              sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw" unoptimized={product.images[0].startsWith('/uploads/')} />
          )}
        </Link>

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
          {hasOffer && <div className="bg-[#D4AF37] text-[#0A0A0A] px-2 py-0.5"><span className="font-label-caps text-[8px] tracking-widest">OFERTA</span></div>}
          {(product.tags ?? []).map(tag => (
            <div key={tag} className="bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5">
              <span className="font-label-caps text-[8px] tracking-widest text-white">{tag}</span>
            </div>
          ))}
        </div>

        <button onClick={handleFav}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            favorited ? 'bg-[#D4AF37]/15 text-[#D4AF37] opacity-100' : 'bg-[#0A0A0A]/50 text-white/40 opacity-0 group-hover:opacity-100'
          } hover:scale-110 active:scale-95`}
          aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>

        <button onClick={handleAdd}
          className={`absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-[#0A0A0A]/60 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-[#D4AF37] hover:text-[#0A0A0A] active:scale-95 transition-all duration-200 ${bounce ? 'scale-125 bg-[#D4AF37] text-[#0A0A0A]' : ''}`}
          aria-label={`Añadir ${product.name} al carrito`}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shopping_bag</span>
        </button>
      </div>

      <Link href={`/product/${product.slug}`} className="block">
        <p className="font-label-caps text-[8px] tracking-[0.2em] text-[#D4AF37] mb-1">{product.brand}</p>
        <h3 className="text-white/80 text-[12px] font-light leading-snug mb-1.5 truncate">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-[13px] tabular-nums font-light ${hasOffer ? 'text-[#D4AF37]' : 'text-white/40'}`}>
            ₲{displayPrice.toLocaleString('es-PY')}
          </span>
          {hasOffer && <span className="text-white/20 text-xs tabular-nums line-through">₲{product.price.toLocaleString('es-PY')}</span>}
        </div>
      </Link>
    </article>
  )
}

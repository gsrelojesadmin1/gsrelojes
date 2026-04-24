'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import type { Product, SiteData } from '@/lib/types'
import Footer from '@/components/Footer'

// ── Estilos predefinidos de reloj ────────────────────────────
const STYLES = ['VESTIR', 'DEPORTE', 'BUCEO', 'AVIADOR', 'DIGITAL', 'CLÁSICO', 'SPORT', 'LUXURY']

// ── Rangos de precio en guaraníes ────────────────────────────
const PRICE_RANGES = [
  { label: 'Hasta ₲10M', min: 0, max: 10_000_000 },
  { label: '₲10M – ₲25M', min: 10_000_000, max: 25_000_000 },
  { label: '₲25M – ₲50M', min: 25_000_000, max: 50_000_000 },
  { label: 'Más de ₲50M', min: 50_000_000, max: Infinity },
]

// ── Sorts ────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc', label: 'Nombre A–Z' },
]

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''

  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')
  const [searchInput, setSearchInput] = useState(q)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => { setSiteData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Marcas únicas
  const brands = useMemo(() => {
    if (!siteData) return []
    const set = new Set(siteData.products.map(p => p.brand))
    return Array.from(set).sort()
  }, [siteData])

  // Modelos únicos (de los watchBrands)
  const models = useMemo(() => {
    if (!siteData) return []
    const result: string[] = []
    for (const brand of siteData.watchBrands) {
      // Si se filtró por marca, mostrar solo colecciones de esa marca
      if (selectedBrands.length > 0 && !selectedBrands.some(b => b.toLowerCase().includes(brand.name.toLowerCase().split(' ')[0].toLowerCase()))) continue
      for (const col of brand.collections) {
        result.push(col.name)
      }
    }
    return result.sort()
  }, [siteData, selectedBrands])

  // Filtrado + búsqueda + ordenamiento
  const results = useMemo(() => {
    if (!siteData) return []
    let list = [...siteData.products]

    // Texto
    if (q.trim().length > 0) {
      const term = q.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
      )
    }

    // Marca
    if (selectedBrands.length > 0) {
      list = list.filter(p => selectedBrands.includes(p.brand))
    }

    // Modelo/colección
    if (selectedModels.length > 0) {
      list = list.filter(p => {
        const brand = siteData.watchBrands.find(b => b.id === p.category.brandId)
        const col = brand?.collections.find(c => c.id === p.category.collectionId)
        return col ? selectedModels.includes(col.name) : false
      })
    }

    // Precio
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange]
      list = list.filter(p => {
        const price = p.salePrice ?? p.price
        return price >= range.min && price <= range.max
      })
    }

    // Estilo — busca en nombre/descripción
    if (selectedStyles.length > 0) {
      list = list.filter(p =>
        selectedStyles.some(s =>
          p.name.toLowerCase().includes(s.toLowerCase()) ||
          p.description.toLowerCase().includes(s.toLowerCase()) ||
          p.brand.toLowerCase().includes(s.toLowerCase())
        )
      )
    }

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
        break
      case 'price-desc':
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
        break
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return list
  }, [siteData, q, selectedBrands, selectedModels, selectedPriceRange, selectedStyles, sortBy])

  const toggleBrand = (brand: string) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])

  const toggleModel = (model: string) =>
    setSelectedModels(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model])

  const toggleStyle = (style: string) =>
    setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style])

  const clearFilters = () => {
    setSelectedBrands([])
    setSelectedModels([])
    setSelectedPriceRange(null)
    setSelectedStyles([])
  }

  const activeFilterCount = selectedBrands.length + selectedModels.length + (selectedPriceRange !== null ? 1 : 0) + selectedStyles.length

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    router.push(`/buscar?q=${encodeURIComponent(searchInput.trim())}`)
    clearFilters()
  }

  return (
    <>
      <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
        {/* ── Barra de búsqueda superior ──────────────────────── */}
        <div className="border-b border-white/8 bg-[#0A0A0A]/95">
          <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <form onSubmit={handleNewSearch} className="flex-1 flex items-center gap-3 bg-[#111] border border-white/10 px-4 py-3 focus-within:border-[#D4AF37]/30 transition-colors">
              <span className="material-symbols-outlined text-white/30" style={{ fontSize: '18px' }}>search</span>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar relojes, marcas, modelos..."
                className="flex-1 bg-transparent text-white text-sm font-light outline-none placeholder:text-white/25"
                autoFocus
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput('')} className="text-white/25 hover:text-white/60">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                </button>
              )}
              <button type="submit" className="font-label-caps text-[9px] tracking-[0.15em] text-[#D4AF37] hover:text-[#f2ca50] transition-colors px-2">
                BUSCAR
              </button>
            </form>
            <Link href="/" className="flex items-center gap-1.5 text-white/25 hover:text-white/60 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              <span className="font-label-caps text-[9px] tracking-[0.15em]">VOLVER</span>
            </Link>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-8">
          {/* ── Header resultados ────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              {q ? (
                <>
                  <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/25 mb-1">RESULTADOS DE BÚSQUEDA</p>
                  <h1 className="text-white text-xl font-light">
                    &ldquo;{q}&rdquo;
                    {!loading && (
                      <span className="text-white/25 text-sm ml-3 font-light">
                        {results.length} {results.length === 1 ? 'pieza' : 'piezas'}
                      </span>
                    )}
                  </h1>
                </>
              ) : (
                <>
                  <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/25 mb-1">CATÁLOGO</p>
                  <h1 className="text-white text-xl font-light">
                    Todos los Relojes
                    {!loading && (
                      <span className="text-white/25 text-sm ml-3 font-light">{results.length} piezas</span>
                    )}
                  </h1>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Botón filtros mobile */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`lg:hidden flex items-center gap-2 px-4 py-2.5 border font-label-caps text-[9px] tracking-[0.15em] transition-colors ${filtersOpen ? 'border-[#D4AF37]/40 text-[#D4AF37]' : 'border-white/12 text-white/40'}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>tune</span>
                FILTROS {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[9px] tracking-[0.15em] text-white/25 hidden sm:block">ORDENAR</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white text-xs font-light px-3 py-2.5 outline-none focus:border-[#D4AF37]/30 transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* ── Sidebar de filtros ──────────────────────────────── */}
            <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-none`}>
              <div className="bg-[#0d0d0d] border border-white/8 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/50">FILTROS</p>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="font-label-caps text-[9px] tracking-[0.12em] text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
                    >
                      LIMPIAR ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* ── Filtro: Marca ─── */}
                <FilterSection title="MARCA">
                  <div className="space-y-1.5">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          onClick={() => toggleBrand(brand)}
                          className={`w-4 h-4 border flex-none flex items-center justify-center transition-colors cursor-pointer ${
                            selectedBrands.includes(brand)
                              ? 'border-[#D4AF37] bg-[#D4AF37]'
                              : 'border-white/20 group-hover:border-white/40'
                          }`}
                        >
                          {selectedBrands.includes(brand) && (
                            <span className="material-symbols-outlined text-[#0A0A0A]" style={{ fontSize: '11px' }}>check</span>
                          )}
                        </div>
                        <span
                          onClick={() => toggleBrand(brand)}
                          className={`text-xs font-light leading-none transition-colors cursor-pointer ${
                            selectedBrands.includes(brand) ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                          }`}
                        >
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* ── Filtro: Modelo/Colección ─── */}
                <FilterSection title="COLECCIÓN">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff20 transparent' }}>
                    {models.map(model => (
                      <label key={model} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          onClick={() => toggleModel(model)}
                          className={`w-4 h-4 border flex-none flex items-center justify-center transition-colors cursor-pointer ${
                            selectedModels.includes(model)
                              ? 'border-[#D4AF37] bg-[#D4AF37]'
                              : 'border-white/20 group-hover:border-white/40'
                          }`}
                        >
                          {selectedModels.includes(model) && (
                            <span className="material-symbols-outlined text-[#0A0A0A]" style={{ fontSize: '11px' }}>check</span>
                          )}
                        </div>
                        <span
                          onClick={() => toggleModel(model)}
                          className={`text-xs font-light leading-none transition-colors cursor-pointer ${
                            selectedModels.includes(model) ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                          }`}
                        >
                          {model}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* ── Filtro: Precio ─── */}
                <FilterSection title="PRECIO">
                  <div className="space-y-1.5">
                    {PRICE_RANGES.map((range, i) => (
                      <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                          className={`w-4 h-4 border flex-none flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                            selectedPriceRange === i
                              ? 'border-[#D4AF37] bg-[#D4AF37]'
                              : 'border-white/20 group-hover:border-white/40'
                          }`}
                        >
                          {selectedPriceRange === i && (
                            <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
                          )}
                        </div>
                        <span
                          onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                          className={`text-xs font-light leading-none transition-colors cursor-pointer ${
                            selectedPriceRange === i ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                          }`}
                        >
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* ── Filtro: Estilo ─── */}
                <FilterSection title="ESTILO" noBorder>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(style => (
                      <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-2.5 py-1.5 font-label-caps text-[8px] tracking-[0.12em] border transition-all duration-150 ${
                          selectedStyles.includes(style)
                            ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37]'
                            : 'border-white/10 text-white/30 hover:border-white/25 hover:text-white/60'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </aside>

            {/* ── Grid de resultados ──────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <span className="material-symbols-outlined text-white/20 animate-spin" style={{ fontSize: '32px' }}>refresh</span>
                  <p className="text-white/30 text-sm font-light">Cargando...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
                  <span className="material-symbols-outlined text-white/15" style={{ fontSize: '52px' }}>search_off</span>
                  <div>
                    <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/30 mb-2">SIN RESULTADOS</p>
                    <p className="text-white/20 text-sm font-light max-w-xs">
                      {q ? `No encontramos piezas que coincidan con "${q}".` : 'Ninguna pieza coincide con los filtros seleccionados.'}
                    </p>
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/40 pb-0.5 hover:border-[#D4AF37] transition-colors">
                      LIMPIAR FILTROS
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-5">
                  {results.map(product => (
                    <ResultCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {siteData && <Footer footer={siteData.footer} />}
    </>
  )
}

// ── Sección de filtro colapsable ─────────────────────────────
function FilterSection({ title, children, noBorder }: { title: string; children: React.ReactNode; noBorder?: boolean }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`py-4 ${!noBorder ? 'border-b border-white/8' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="font-label-caps text-[9px] tracking-[0.2em] text-white/35 group-hover:text-white/60 transition-colors">{title}</span>
        <span className={`material-symbols-outlined text-white/20 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ fontSize: '14px' }}>
          expand_more
        </span>
      </button>
      {open && children}
    </div>
  )
}

// ── Tarjeta de resultado ─────────────────────────────────────
function ResultCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [cartBounce, setCartBounce] = useState(false)

  const hasOffer = product.salePrice != null && product.salePrice < product.price
  const displayPrice = hasOffer ? product.salePrice! : product.price
  const favorited = isFavorite(product.id)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product)
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 600)
  }

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-4 border border-white/5 group-hover:border-[#D4AF37]/15 transition-colors duration-500">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized={product.image.startsWith('/uploads/')}
          />
        </Link>

        {/* Oferta badge & Tags */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none items-start">
          {hasOffer && (
            <div className="bg-[#D4AF37] text-[#0A0A0A] px-2 py-0.5">
              <span className="font-label-caps text-[9px] tracking-[0.15em]">OFERTA</span>
            </div>
          )}
          {(product.tags ?? []).map(tag => (
            <div key={tag} className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-2 py-0.5">
              <span className="font-label-caps text-[8px] tracking-[0.15em]">{tag}</span>
            </div>
          ))}
        </div>

        <button
          onClick={e => { e.preventDefault(); toggleFavorite(product) }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${favorited ? 'bg-[#D4AF37]/15 text-[#D4AF37] opacity-100' : 'bg-[#0A0A0A]/50 text-white/40 opacity-0 group-hover:opacity-100'} hover:scale-110 active:scale-95`}
          aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17, fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>

        <button
          onClick={handleAddToCart}
          className={`absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-[#0A0A0A]/60 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-[#D4AF37] hover:text-[#0A0A0A] active:scale-95 transition-all duration-200 ${cartBounce ? 'scale-125 bg-[#D4AF37] text-[#0A0A0A]' : ''}`}
          aria-label={`Añadir ${product.name} al carrito`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>shopping_bag</span>
        </button>
      </div>

      <Link href={`/product/${product.slug}`} className="block">
        <p className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] mb-1.5">{product.brand}</p>
        <h3 className="text-white/85 text-[13px] font-light leading-snug mb-1.5">{product.name}</h3>
        
        {product.sku && (
          <div className="inline-block border border-white/10 bg-white/5 px-1.5 py-0.5 mb-2">
            <p className="font-mono text-[9px] text-white/50 tracking-wider">MOD. {product.sku}</p>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className={`text-sm tabular-nums font-light ${hasOffer ? 'text-[#D4AF37]' : 'text-white/45'}`}>
            ₲{displayPrice.toLocaleString('es-PY')}
          </span>
          {hasOffer && (
            <span className="text-white/25 text-xs tabular-nums line-through font-light">
              ₲{product.price.toLocaleString('es-PY')}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import FavoritesDrawer from '@/components/FavoritesDrawer'
import type { NavbarData, Product } from '@/lib/types'

interface HeaderProps {
  navbar: NavbarData
  announcements?: string[]
}

export default function Header({ navbar, announcements }: HeaderProps) {
  const { totalItems, openCart } = useCart()
  const { totalFavorites } = useFavorites()
  const [favOpen, setFavOpen] = useState(false)
  const router = useRouter()

  // ── Buscador ──────────────────────────────────────────────────
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Cargar productos una vez
  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => setAllProducts(d.products ?? []))
      .catch(() => {})
  }, [])

  // Sugerencias en tiempo real desde 3 letras
  const searchProducts = useCallback((q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const term = q.toLowerCase()
    const results = allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    ).slice(0, 5)
    setSuggestions(results)
    setShowSuggestions(true)
  }, [allProducts])

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(query), 150)
    return () => clearTimeout(timer)
  }, [query, searchProducts])

  // Cerrar al clicar fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToSearch = () => {
    if (!query.trim()) return
    setShowSuggestions(false)
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') goToSearch()
  }

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false)
    setQuery('')
    router.push(`/product/${slug}`)
  }

  return (
    <>
      <header className={`fixed ${announcements && announcements.length > 0 ? 'top-8' : 'top-0'} w-full z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/8 transition-all duration-300`}>
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-8 lg:px-12 h-[72px]">

          {/* Brand */}
          <a href="/" className="font-label-caps text-[11px] tracking-[0.35em] text-[#D4AF37] hover:text-[#f2ca50] transition-colors">
            {navbar.brandName}
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Navegación principal">
            {navbar.links.map((link, idx) => (
              <a
                key={link.id}
                href={link.href}
                className={`font-label-caps text-[10px] tracking-[0.18em] transition-colors duration-300 pb-0.5 ${
                  idx === 0
                    ? 'text-white border-b border-white/50'
                    : 'text-white/40 hover:text-white/80 border-b border-transparent hover:border-white/20'
                }`}
              >
                {link.label.toUpperCase()}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">

            {/* ── Buscador con sugerencias ── */}
            <div ref={searchRef} className="hidden lg:block relative">
              <div className={`flex items-center gap-2 border-b pb-1 transition-colors duration-200 ${
                query.length >= 3 ? 'border-[#D4AF37]/40' : 'border-white/15'
              }`}>
                <button
                  onClick={goToSearch}
                  aria-label="Buscar"
                  className="text-white/35 hover:text-[#D4AF37] transition-colors flex-none"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
                </button>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                  className="bg-transparent text-[10px] uppercase tracking-widest text-white w-40 placeholder:text-white/25 outline-none"
                  placeholder="Buscar piezas..."
                  type="search"
                  aria-label="Buscar"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false) }}
                    className="text-white/20 hover:text-white/60 transition-colors flex-none"
                    aria-label="Limpiar búsqueda"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  </button>
                )}
              </div>

              {/* Dropdown de sugerencias */}
              {showSuggestions && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-[#0d0d0d] border border-white/10 shadow-2xl z-[200]">
                  {suggestions.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <span className="material-symbols-outlined text-white/20 mb-2 block" style={{ fontSize: '24px' }}>
                        search_off
                      </span>
                      <p className="text-white/30 text-xs font-light">Sin resultados para &ldquo;{query}&rdquo;</p>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
                        <span className="font-label-caps text-[9px] tracking-[0.2em] text-white/25">RESULTADOS</span>
                        <span className="font-label-caps text-[9px] tracking-[0.1em] text-[#D4AF37]/60">
                          {suggestions.length} pieza{suggestions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <ul>
                        {suggestions.map(product => {
                          const displayPrice = product.salePrice ?? product.price
                          return (
                            <li key={product.id}>
                              <button
                                onClick={() => handleSuggestionClick(product.slug)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left group"
                              >
                                <div className="w-10 h-12 relative flex-none bg-[#111] overflow-hidden">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                    unoptimized={product.image.startsWith('/uploads/')}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-label-caps text-[8px] tracking-[0.18em] text-[#D4AF37] mb-0.5">
                                    {product.brand}
                                  </p>
                                  <p className="text-white text-xs font-light truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-white/40 text-[11px] tabular-nums mt-0.5">
                                    ₲{displayPrice.toLocaleString('es-PY')}
                                  </p>
                                </div>
                                <span
                                  className="material-symbols-outlined text-white/15 group-hover:text-[#D4AF37]/50 transition-colors flex-none"
                                  style={{ fontSize: '14px' }}
                                >
                                  arrow_forward
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                      <div className="border-t border-white/8">
                        <button
                          onClick={goToSearch}
                          className="w-full px-4 py-3 flex items-center justify-center gap-2 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                        >
                          <span className="font-label-caps text-[9px] tracking-[0.2em]">VER TODOS LOS RESULTADOS</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Favoritos */}
            <button
              onClick={() => setFavOpen(true)}
              className="relative text-white/40 hover:text-white transition-colors p-1"
              aria-label={`Favoritos, ${totalFavorites} piezas guardadas`}
            >
              <span
                className="material-symbols-outlined transition-all duration-200"
                style={{
                  fontSize: 20,
                  fontVariationSettings: totalFavorites > 0 ? "'FILL' 1" : "'FILL' 0",
                  color: totalFavorites > 0 ? '#D4AF37' : undefined,
                }}
              >
                favorite
              </span>
              {totalFavorites > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {totalFavorites > 9 ? '9+' : totalFavorites}
                </span>
              )}
            </button>

            {/* Carrito */}
            <button
              onClick={openCart}
              className="relative text-white/40 hover:text-white transition-colors p-1"
              aria-label={`Carrito, ${totalItems} artículos`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            <button onClick={() => router.push('/buscar')} className="block lg:hidden text-white/40 hover:text-white transition-colors p-1" aria-label="Buscar">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
            </button>

            <button className="hidden lg:block text-white/40 hover:text-white transition-colors p-1" aria-label="Cuenta">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
            </button>
          </div>
        </div>
      </header>

      <FavoritesDrawer isOpen={favOpen} onClose={() => setFavOpen(false)} />
    </>
  )
}

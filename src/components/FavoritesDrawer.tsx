'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'

interface FavoritesDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function FavoritesDrawer({ isOpen, onClose }: FavoritesDrawerProps) {
  const { favorites, removeFavorite, totalFavorites } = useFavorites()
  const { addItem } = useCart()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleAddToCart(product: typeof favorites[0]) {
    addItem(product)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-[440px] bg-[#080808] border-l border-white/8 z-[101] flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Favoritos"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-white/8">
          <div>
            <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37]">TUS FAVORITOS</p>
            <p className="text-white/40 text-[11px] mt-1 font-light">
              {totalFavorites === 0
                ? 'Sin piezas guardadas'
                : `${totalFavorites} ${totalFavorites === 1 ? 'pieza guardada' : 'piezas guardadas'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            aria-label="Cerrar favoritos"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <span
                className="material-symbols-outlined text-white/10"
                style={{ fontSize: 52, fontVariationSettings: "'FILL' 0" }}
              >
                favorite
              </span>
              <div>
                <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/30 mb-2">
                  TUS FAVORITOS ESTÁN VACÍOS
                </p>
                <p className="text-white/20 text-xs font-light">
                  Guarda tus piezas favoritas tocando el corazón
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 font-label-caps text-[10px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/50 pb-0.5 hover:border-[#D4AF37] transition-colors"
              >
                EXPLORAR PIEZAS
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {favorites.map(product => {
                const hasOffer = product.salePrice != null && product.salePrice < product.price
                const displayPrice = hasOffer ? product.salePrice! : product.price

                return (
                  <li key={product.id} className="flex gap-5 px-8 py-6 group/item">
                    {/* Imagen */}
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="relative w-[64px] h-[80px] flex-none bg-[#111] overflow-hidden block"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="64px"
                        unoptimized={product.image.startsWith('/uploads/')}
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-label-caps text-[9px] tracking-[0.18em] text-[#D4AF37] mb-1">
                        {product.brand}
                      </p>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="text-white text-[13px] font-light leading-snug hover:text-white/70 transition-colors block mb-2"
                      >
                        {product.name}
                      </Link>

                      {/* Precio */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-sm tabular-nums font-light ${hasOffer ? 'text-[#D4AF37]' : 'text-white/55'}`}>
                          ₲{displayPrice.toLocaleString('es-PY')}
                        </span>
                        {hasOffer && (
                          <span className="text-white/25 text-xs tabular-nums line-through font-light">
                            ₲{product.price.toLocaleString('es-PY')}
                          </span>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[9px] tracking-[0.15em] hover:bg-[#c9a430] transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>shopping_bag</span>
                          AÑADIR AL CARRITO
                        </button>
                        <button
                          onClick={() => removeFavorite(product.id)}
                          className="w-7 h-7 flex items-center justify-center text-white/25 hover:text-red-400 transition-colors"
                          aria-label="Quitar de favoritos"
                          title="Quitar de favoritos"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer — solo cuando hay favoritos */}
        {favorites.length > 0 && (
          <div className="border-t border-white/8 px-8 py-6">
            <button
              onClick={() => {
                favorites.forEach(p => addItem(p))
                onClose()
              }}
              className="w-full py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[11px] tracking-[0.22em] hover:bg-[#c9a430] transition-colors mb-3 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shopping_bag</span>
              AÑADIR TODO AL CARRITO
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-white/12 text-white/50 font-label-caps text-[10px] tracking-[0.18em] hover:border-white/25 hover:text-white/80 transition-colors"
            >
              SEGUIR COMPRANDO
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

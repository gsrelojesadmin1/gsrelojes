'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { toastAddedToCart } from '@/lib/toast'
import type { Product } from '@/lib/types'

interface Props {
  brandName: string
  brandId: string
  products: Product[]
}

export default function BrandSection({ brandName, brandId, products }: Props) {
  const visible = products.slice(0, 5)
  const hasMore = products.length > 5

  return (
    <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-16 border-t border-white/5">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-label-caps text-[9px] tracking-[0.3em] text-white/25 mb-2">COLECCIÓN</p>
          <h2
            className="font-label-caps text-[18px] tracking-[0.12em] text-white"
            style={{ fontWeight: 400 }}
          >
            {brandName}
          </h2>
        </div>

        <Link
          href={`/brand/${brandId}`}
          className="flex items-center gap-2 group pb-0.5 border-b border-white/15 hover:border-[#D4AF37]/50 transition-colors"
        >
          <span className="font-label-caps text-[9px] tracking-[0.2em] text-white/35 group-hover:text-[#D4AF37] transition-colors">
            VER TODO
          </span>
          <span
            className="material-symbols-outlined text-white/25 group-hover:text-[#D4AF37] transition-colors"
            style={{ fontSize: 13 }}
          >
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-5">
        {visible.map(product => (
          <BrandProductCard key={product.id} product={product} />
        ))}

        {/* "Ver todo" card if there are more products */}
        {hasMore && (
          <Link
            href={`/brand/${brandId}`}
            className="group flex flex-col items-center justify-center aspect-[3/4] bg-[#111] border border-white/8 hover:border-[#D4AF37]/20 transition-colors duration-300"
          >
            <span
              className="material-symbols-outlined text-white/20 group-hover:text-[#D4AF37]/50 transition-colors mb-3"
              style={{ fontSize: 28 }}
            >
              add
            </span>
            <span className="font-label-caps text-[9px] tracking-[0.2em] text-white/25 group-hover:text-[#D4AF37]/60 transition-colors">
              +{products.length - 5} MÁS
            </span>
          </Link>
        )}
      </div>
    </section>
  )
}

function BrandProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [cartBounce, setCartBounce] = useState(false)

  const hasOffer = product.salePrice != null && product.salePrice < product.price
  const displayPrice = hasOffer ? product.salePrice! : product.price
  const favorited = isFavorite(product.id)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toastAddedToCart(product.name)
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 600)
  }

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <article className="group" aria-label={`${product.brand} ${product.name}`}>
      <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-4 border border-white/5 group-hover:border-[#D4AF37]/15 transition-colors duration-500">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={product.image.startsWith('/uploads/')}
          />
        </Link>

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
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            favorited ? 'bg-[#D4AF37]/15 text-[#D4AF37] opacity-100' : 'bg-[#0A0A0A]/50 text-white/40 opacity-0 group-hover:opacity-100'
          } hover:scale-110 active:scale-95`}
          aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <span className="material-symbols-outlined transition-all duration-200" style={{ fontSize: 17, fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>

        <button
          onClick={handleAddToCart}
          className={`absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-[#0A0A0A]/60 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-[#D4AF37] hover:text-[#0A0A0A] active:scale-95 transition-all duration-200 ${
            cartBounce ? 'scale-125 bg-[#D4AF37] text-[#0A0A0A]' : ''
          }`}
          aria-label={`Añadir ${product.name} al carrito`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>shopping_bag</span>
        </button>
      </div>

      <Link href={`/product/${product.slug}`} className="block">
        <h3 className="text-white/75 text-[12px] font-light leading-snug mb-1.5 truncate">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-sm tabular-nums font-light ${hasOffer ? 'text-[#D4AF37]' : 'text-white/40'}`}>
            ₲{displayPrice.toLocaleString('es-PY')}
          </span>
          {hasOffer && (
            <span className="text-white/20 text-xs tabular-nums line-through font-light">
              ₲{product.price.toLocaleString('es-PY')}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}

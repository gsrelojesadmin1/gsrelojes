'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { toastAddedToCart } from '@/lib/toast'
import type { Product } from '@/lib/types'

interface Props {
  products: Product[]
}

export default function BestSellersSection({ products }: Props) {
  const bestSellers = products.filter(p => p.bestSeller)
  if (bestSellers.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-3">
            SELECCIÓN PREMIUM
          </p>
          <h2
            className="font-headline-lg text-white"
            style={{ fontWeight: 300, letterSpacing: '0.02em' }}
          >
            MÁS VENDIDOS
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-2 pb-1 border-b border-white/15">
          <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontSize: 14 }}>
            trending_up
          </span>
          <span className="font-label-caps text-[9px] tracking-[0.18em] text-white/30">
            {bestSellers.length} {bestSellers.length === 1 ? 'PIEZA' : 'PIEZAS'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-5">
        {bestSellers.map(product => (
          <BestSellerCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function BestSellerCard({ product }: { product: Product }) {
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
      <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-5 border border-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-colors duration-500">

        {/* Best seller ribbon */}
        <div className="absolute top-0 left-0 z-10 bg-[#D4AF37] px-2 py-1 pointer-events-none">
          <span className="font-label-caps text-[8px] tracking-[0.15em] text-[#0A0A0A]">★ TOP</span>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 ease-out ${product.images?.[0] ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={product.image.startsWith('/uploads/')}
          />
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              unoptimized={product.images[0].startsWith('/uploads/')}
            />
          )}
        </Link>

        {hasOffer && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none mt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 text-white px-2 py-0.5">
              <span className="font-label-caps text-[8px] tracking-[0.15em]">OFERTA</span>
            </div>
          </div>
        )}

        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            favorited ? 'bg-[#D4AF37]/15 text-[#D4AF37] opacity-100' : 'bg-[#0A0A0A]/50 text-white/40 opacity-0 group-hover:opacity-100'
          } hover:scale-110 active:scale-95`}
          aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <span
            className="material-symbols-outlined transition-all duration-200"
            style={{ fontSize: 17, fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
          >
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

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-28">
      <div className="mb-16 text-center">
        <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-4">SELECCIÓN CURADA</p>
        <h2 className="font-headline-lg text-white" style={{ fontWeight: 300, letterSpacing: '0.02em' }}>
          LA COLECCIÓN
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-14 gap-x-5">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-20 text-center">
        <button className="px-12 py-4 border border-[#D4AF37]/40 text-[#D4AF37] font-label-caps text-[10px] tracking-[0.25em] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300">
          VER TODAS LAS PIEZAS
        </button>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
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
      {/* ── Image container ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-5 border border-white/5 group-hover:border-[#D4AF37]/15 transition-colors duration-500">

        {/* Link que ocupa toda la imagen — navega al detalle */}
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
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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

        {/* ── Icono corazón — esquina superior derecha ──────────── */}
        <button
          onClick={handleToggleFavorite}
          className={`
            absolute top-3 right-3 z-20
            w-8 h-8 flex items-center justify-center
            transition-all duration-200
            ${favorited
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] opacity-100'
              : 'bg-[#0A0A0A]/50 text-white/40 opacity-0 group-hover:opacity-100'
            }
            hover:scale-110 active:scale-95
          `}
          aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          title={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <span
            className="material-symbols-outlined transition-all duration-200"
            style={{
              fontSize: 17,
              fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
        </button>

        {/* ── Icono carrito — esquina inferior derecha ──────────── */}
        <button
          onClick={handleAddToCart}
          className={`
            absolute bottom-3 right-3 z-20
            w-8 h-8 flex items-center justify-center
            bg-[#0A0A0A]/60 text-white/50
            opacity-0 group-hover:opacity-100
            hover:bg-[#D4AF37] hover:text-[#0A0A0A]
            active:scale-95
            transition-all duration-200
            ${cartBounce ? 'scale-125 bg-[#D4AF37] text-[#0A0A0A]' : ''}
          `}
          aria-label={`Añadir ${product.name} al carrito`}
          title="Añadir al carrito"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 17 }}
          >
            shopping_bag
          </span>
        </button>
      </div>

      {/* ── Info — link al detalle ─────────────────────────────── */}
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

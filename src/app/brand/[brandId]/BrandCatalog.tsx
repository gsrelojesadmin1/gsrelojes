'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { toastAddedToCart } from '@/lib/toast'
import type { Product, WatchBrand } from '@/lib/types'

interface Props {
  brand: WatchBrand
  products: Product[]
}

export default function BrandCatalog({ brand, products }: Props) {
  const [activeCollection, setActiveCollection] = useState<string>('all')

  const filtered = activeCollection === 'all'
    ? products
    : products.filter(p => p.category.collectionId === activeCollection)

  return (
    <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-20">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-12" aria-label="Breadcrumb">
        <Link href="/" className="font-label-caps text-[9px] tracking-[0.18em] text-white/25 hover:text-white/50 transition-colors">
          INICIO
        </Link>
        <span className="text-white/15 text-xs">›</span>
        <span className="font-label-caps text-[9px] tracking-[0.18em] text-[#D4AF37]">
          {brand.name}
        </span>
      </nav>

      {/* Brand header */}
      <div className="mb-16">
        <p className="font-label-caps text-[10px] tracking-[0.3em] text-white/25 mb-4">CATÁLOGO DE MARCA</p>
        <h1
          className="font-label-caps text-[32px] md:text-[48px] tracking-[0.08em] text-white mb-4"
          style={{ fontWeight: 300 }}
        >
          {brand.name}
        </h1>
        <p className="text-white/30 font-light text-sm">
          {products.length} {products.length === 1 ? 'pieza disponible' : 'piezas disponibles'}
        </p>
      </div>

      {/* Collection filter tabs */}
      {brand.collections.length > 0 && (
        <div className="flex items-center gap-1 mb-12 flex-wrap">
          <button
            onClick={() => setActiveCollection('all')}
            className={`px-4 py-2 font-label-caps text-[9px] tracking-[0.2em] border transition-colors duration-200 ${
              activeCollection === 'all'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/60'
            }`}
          >
            TODOS
          </button>
          {brand.collections.map(col => {
            const count = products.filter(p => p.category.collectionId === col.id).length
            if (count === 0) return null
            return (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-4 py-2 font-label-caps text-[9px] tracking-[0.2em] border transition-colors duration-200 ${
                  activeCollection === col.id
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                    : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/60'
                }`}
              >
                {col.name.toUpperCase()}
                <span className="ml-2 text-[8px] opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-white/10 mb-4" style={{ fontSize: 48 }}>
            watch_off
          </span>
          <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/20">SIN PIEZAS EN ESTA COLECCIÓN</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-14 gap-x-5">
          {filtered.map(product => (
            <BrandProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
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
      <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-5 border border-white/5 group-hover:border-[#D4AF37]/15 transition-colors duration-500">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true">
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

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none items-start">
          {hasOffer && (
            <div className="bg-[#D4AF37] text-[#0A0A0A] px-2 py-0.5">
              <span className="font-label-caps text-[9px] tracking-[0.15em]">OFERTA</span>
            </div>
          )}
          {product.bestSeller && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 text-white px-2 py-0.5">
              <span className="font-label-caps text-[8px] tracking-[0.15em]">★ TOP</span>
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

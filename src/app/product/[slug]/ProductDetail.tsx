'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/lib/types'

interface Breadcrumb {
  brand: string
  collection?: string
  model?: string
}

interface Props {
  product: Product
  recommended: Product[]
  breadcrumb: Breadcrumb
}

export default function ProductDetail({ product, recommended, breadcrumb }: Props) {
  const { addItem, openCart } = useCart()

  // Primary image always first, then additional gallery images
  const gallery = [product.image, ...(product.images ?? [])].filter(Boolean)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [added, setAdded] = useState(false)
  const thumbsRef = useRef<HTMLDivElement>(null)

  const hasOffer = product.salePrice != null && product.salePrice < product.price
  const displayPrice = hasOffer ? product.salePrice! : product.price
  const discount = hasOffer
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0

  // Reset on product change
  useEffect(() => {
    setActiveIndex(0)
    setIsImageLoaded(false)
  }, [product.id])

  function selectImage(index: number) {
    if (index === activeIndex) return
    setIsImageLoaded(false)
    setActiveIndex(index)
    // scroll thumb into view
    const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  function handleAddToCart() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const isLocal = (url: string) => url.startsWith('/uploads/')

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <nav className="max-w-[1440px] mx-auto px-8 lg:px-12 pt-8 pb-0 flex items-center gap-2 text-white/25 text-[10px] font-label-caps tracking-[0.15em]">
        <Link href="/" className="hover:text-white/60 transition-colors">INICIO</Link>
        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chevron_right</span>
        <Link href="/" className="hover:text-white/60 transition-colors">COLECCIÓN</Link>
        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chevron_right</span>
        <span className="text-white/45">{breadcrumb.brand}</span>
        {breadcrumb.collection && (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chevron_right</span>
            <span className="text-white/45">{breadcrumb.collection}</span>
          </>
        )}
        {breadcrumb.model && (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chevron_right</span>
            <span className="text-[#D4AF37]/70">{breadcrumb.model}</span>
          </>
        )}
      </nav>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-10 xl:gap-16 items-start">

          {/* ── Gallery ────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-8">
            {/* Main image */}
            <div className="relative aspect-[4/5] bg-[#0e0e0e] border border-white/5 overflow-hidden group">
              <Image
                key={activeIndex}
                src={gallery[activeIndex]}
                alt={`${product.name} — imagen ${activeIndex + 1}`}
                fill
                priority
                className={`object-cover transition-all duration-500 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'} group-hover:scale-[1.03]`}
                sizes="(max-width: 1024px) 100vw, 55vw"
                unoptimized={isLocal(gallery[activeIndex])}
                onLoad={() => setIsImageLoaded(true)}
              />

              {/* Offer badge */}
              {hasOffer && (
                <div className="absolute top-5 left-5 bg-[#D4AF37] text-[#0A0A0A] px-3 py-1">
                  <span className="font-label-caps text-[9px] tracking-[0.2em]">−{discount}% OFERTA</span>
                </div>
              )}

              {/* Image counter */}
              {gallery.length > 1 && (
                <div className="absolute bottom-5 right-5 bg-[#0A0A0A]/70 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5">
                  <span className="font-label-caps text-[9px] tracking-[0.1em] text-white/60">
                    {activeIndex + 1} / {gallery.length}
                  </span>
                </div>
              )}

              {/* Arrow navigation for desktop */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => selectImage((activeIndex - 1 + gallery.length) % gallery.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Imagen anterior"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                  </button>
                  <button
                    onClick={() => selectImage((activeIndex + 1) % gallery.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Imagen siguiente"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div
                ref={thumbsRef}
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none' }}
              >
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => selectImage(i)}
                    className={`relative flex-none w-[72px] h-[90px] border transition-all duration-200 overflow-hidden ${
                      i === activeIndex
                        ? 'border-[#D4AF37] opacity-100'
                        : 'border-white/8 opacity-45 hover:opacity-75 hover:border-white/20'
                    }`}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="72px"
                      unoptimized={isLocal(src)}
                    />
                    {i === activeIndex && (
                      <div className="absolute inset-0 border-2 border-[#D4AF37] pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:pt-2">
            {/* Brand + model */}
            <div>
              <p className="font-label-caps text-[10px] tracking-[0.35em] text-[#D4AF37] mb-3">
                {product.brand}
              </p>
              <h1
                className="text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-noto-serif)', fontWeight: 200, fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '0.01em' }}
              >
                {product.name}
              </h1>
              <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/20">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 py-5 border-y border-white/6">
              <span
                className={`tabular-nums font-light ${hasOffer ? 'text-[#D4AF37]' : 'text-white'}`}
                style={{ fontSize: 'clamp(22px, 2.5vw, 30px)' }}
              >
                ${displayPrice.toLocaleString()}
              </span>
              {hasOffer && (
                <>
                  <span className="text-white/30 text-lg tabular-nums line-through font-light">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="font-label-caps text-[9px] tracking-[0.15em] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1">
                    −{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-white/55 text-sm font-light leading-relaxed tracking-wide">
              {product.description}
            </p>

            {/* Category detail */}
            {(breadcrumb.collection || breadcrumb.model) && (
              <div className="flex flex-wrap gap-2">
                {[breadcrumb.brand, breadcrumb.collection, breadcrumb.model]
                  .filter(Boolean)
                  .map((label, i) => (
                    <span
                      key={i}
                      className="font-label-caps text-[9px] tracking-[0.15em] text-white/30 border border-white/8 px-2.5 py-1"
                    >
                      {label}
                    </span>
                  ))}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 flex items-center justify-center gap-3 font-label-caps text-[11px] tracking-[0.3em] transition-all duration-300 ${
                  added
                    ? 'bg-white/10 text-white/60 border border-white/15'
                    : 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#c9a430]'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {added ? 'check' : 'shopping_bag'}
                </span>
                {added ? 'AÑADIDO AL CARRITO' : 'ADD TO COLLECTION'}
              </button>

              <button
                onClick={openCart}
                className="w-full py-3.5 border border-white/12 text-white/45 font-label-caps text-[10px] tracking-[0.2em] hover:border-white/30 hover:text-white/70 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>shopping_cart</span>
                VER CARRITO
              </button>
            </div>

            {/* Details accordion */}
            <ProductAccordion />
          </div>
        </div>
      </div>

      {/* ── Recommended ──────────────────────────────────────────────────────── */}
      {recommended.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-16 border-t border-white/5">
          <div className="mb-10">
            <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-3">TAMBIÉN TE PUEDE INTERESAR</p>
            <h2 className="text-white text-xl font-light" style={{ letterSpacing: '0.02em' }}>
              Piezas Relacionadas
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-5">
            {recommended.map(rec => {
              const recOffer = rec.salePrice != null && rec.salePrice < rec.price
              const recPrice = recOffer ? rec.salePrice! : rec.price

              return (
                <article key={rec.id} className="group">
                  <Link href={`/product/${rec.slug}`} className="block">
                    <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-4 border border-white/5 group-hover:border-[#D4AF37]/20 transition-all duration-500">
                      <Image
                        src={rec.image}
                        alt={rec.name}
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        unoptimized={isLocal(rec.image)}
                      />
                      {recOffer && (
                        <div className="absolute top-2.5 left-2.5 bg-[#D4AF37] text-[#0A0A0A] px-1.5 py-0.5">
                          <span className="font-label-caps text-[8px] tracking-[0.15em]">OFERTA</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/30 transition-colors duration-300" />
                    </div>

                    <p className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] mb-1">{rec.brand}</p>
                    <h3 className="text-white/80 text-[12px] font-light leading-snug mb-1.5">{rec.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm tabular-nums font-light ${recOffer ? 'text-[#D4AF37]' : 'text-white/40'}`}>
                        ${recPrice.toLocaleString()}
                      </span>
                      {recOffer && (
                        <span className="text-white/20 text-xs tabular-nums line-through font-light">
                          ${rec.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-10 py-3.5 border border-[#D4AF37]/30 text-[#D4AF37] font-label-caps text-[10px] tracking-[0.25em] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>grid_view</span>
              VER TODA LA COLECCIÓN
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

// ── Simple static accordion ─────────────────────────────────────────────────

const SPECS = [
  { label: 'Garantía', value: 'Internacional — 2 años' },
  { label: 'Entrega', value: 'Envío gratuito mundial en 3–5 días hábiles' },
  { label: 'Autenticidad', value: 'Certificado de autenticidad incluido' },
  { label: 'Devoluciones', value: 'Devolución gratuita en 14 días' },
]

function ProductAccordion() {
  const [open, setOpen] = useState<string | null>(null)

  const items = [
    {
      id: 'specs',
      label: 'Especificaciones y Garantía',
      icon: 'verified',
      content: (
        <dl className="space-y-3">
          {SPECS.map(s => (
            <div key={s.label} className="flex justify-between gap-4">
              <dt className="font-label-caps text-[9px] tracking-[0.15em] text-white/30">{s.label.toUpperCase()}</dt>
              <dd className="text-white/55 text-[12px] font-light text-right">{s.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      id: 'shipping',
      label: 'Envío y Devoluciones',
      icon: 'local_shipping',
      content: (
        <p className="text-white/50 text-[12px] font-light leading-relaxed">
          Cada pieza viaja en su estuche original dentro de un embalaje de madera lacada. El seguro de transporte
          cubre el valor completo del reloj hasta su recepción confirmada.
        </p>
      ),
    },
  ]

  return (
    <div className="border-t border-white/6 mt-2">
      {items.map(item => (
        <div key={item.id} className="border-b border-white/6">
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className="w-full flex items-center justify-between py-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/25 group-hover:text-white/50 transition-colors" style={{ fontSize: 16 }}>
                {item.icon}
              </span>
              <span className="font-label-caps text-[9px] tracking-[0.15em] text-white/40 group-hover:text-white/70 transition-colors">
                {item.label.toUpperCase()}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-white/20 transition-transform duration-200 ${open === item.id ? 'rotate-45' : ''}`}
              style={{ fontSize: 16 }}
            >
              add
            </span>
          </button>

          {open === item.id && (
            <div className="pb-5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

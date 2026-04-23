'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()

  return (
    <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-28">
      <div className="mb-16 text-center">
        <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-4">CURATED SELECTION</p>
        <h2 className="font-headline-lg text-white" style={{ fontWeight: 300, letterSpacing: '0.02em' }}>
          THE COLLECTION
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-14 gap-x-5">
        {products.map(product => {
          const hasOffer = product.salePrice != null && product.salePrice < product.price
          const displayPrice = hasOffer ? product.salePrice! : product.price

          return (
            <article
              key={product.id}
              className="group cursor-pointer"
              aria-label={`${product.brand} ${product.name} — $${displayPrice.toLocaleString()}`}
            >
              <Link href={`/product/${product.slug}`} className="block">
                {/* Image container */}
                <div className="relative overflow-hidden bg-[#111] aspect-[3/4] mb-5 border border-white/5 group-hover:border-[#D4AF37]/20 transition-all duration-500">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    unoptimized={product.image.startsWith('/uploads/')}
                  />

                  {hasOffer && (
                    <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0A0A0A] px-2 py-0.5">
                      <span className="font-label-caps text-[9px] tracking-[0.15em]">OFERTA</span>
                    </div>
                  )}

                  {/* Hover CTA — add to cart */}
                  <div
                    className="absolute inset-0 bg-[#0A0A0A]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                    onClick={e => { e.preventDefault(); addItem(product) }}
                  >
                    <div className="w-full py-4 bg-[#D4AF37] text-center">
                      <span className="font-label-caps text-[10px] tracking-[0.22em] text-[#0A0A0A]">
                        ADD TO COLLECTION
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Info — link to detail */}
              <Link href={`/product/${product.slug}`} className="block">
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] mb-1.5">{product.brand}</p>
                <h3 className="text-white/85 text-[13px] font-light leading-snug mb-2">{product.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm tabular-nums font-light ${hasOffer ? 'text-[#D4AF37]' : 'text-white/45'}`}>
                    ${displayPrice.toLocaleString()}
                  </span>
                  {hasOffer && (
                    <span className="text-white/25 text-xs tabular-nums line-through font-light">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            </article>
          )
        })}
      </div>

      <div className="mt-20 text-center">
        <button className="px-12 py-4 border border-[#D4AF37]/40 text-[#D4AF37] font-label-caps text-[10px] tracking-[0.25em] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300">
          VIEW ALL MASTERPIECES
        </button>
      </div>
    </section>
  )
}

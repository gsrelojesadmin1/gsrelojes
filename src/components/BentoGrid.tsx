'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { BentoItem } from '@/lib/types'

interface BentoGridProps {
  items: BentoItem[]
}

export default function BentoGrid({ items }: BentoGridProps) {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating || index === active) return
    setAnimating(true)
    setTimeout(() => {
      setActive(index)
      setAnimating(false)
    }, 500)
  }, [active, animating])

  const next = useCallback(() => goTo((active + 1) % items.length), [active, items.length, goTo])
  const prev = useCallback(() => goTo((active - 1 + items.length) % items.length), [active, items.length, goTo])

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [items.length, next])

  if (items.length === 0) return null

  const item = items[active]

  return (
    <section className="max-w-[1440px] mx-auto px-8 lg:px-12 py-16">

      {/* Tarjeta contenedora */}
      <div className="relative h-[340px] md:h-[420px] overflow-hidden border border-white/8">

        {/* Slides */}
        {items.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== active}
          >
            <Image
              src={s.src}
              alt={s.title}
              fill
              className="object-cover"
              sizes="(max-width: 1440px) 100vw, 1440px"
              priority={i === 0}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/55 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div
          key={active}
          className={`relative z-10 h-full flex flex-col justify-end px-8 md:px-12 pb-10 max-w-xl transition-all duration-500 ${
            animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <p className="font-label-caps text-[8px] tracking-[0.3em] text-[#D4AF37] mb-3">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </p>
          <h3
            className="text-white mb-2 leading-tight"
            style={{
              fontFamily: 'var(--font-noto-serif)',
              fontWeight: 200,
              fontSize: 'clamp(20px, 2.5vw, 32px)',
              letterSpacing: '-0.01em',
            }}
          >
            {item.title}
          </h3>
          {item.description && (
            <p className="text-white/50 font-light mb-5 max-w-sm leading-relaxed" style={{ fontSize: '13px' }}>
              {item.description}
            </p>
          )}
          <a
            href="#"
            className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/40 w-fit pb-0.5 hover:border-[#D4AF37] transition-colors"
          >
            {item.linkLabel}
          </a>
        </div>

        {/* Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center border border-white/15 text-white/40 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] bg-[#0A0A0A]/30 backdrop-blur-sm transition-all duration-200"
              aria-label="Anterior"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center border border-white/15 text-white/40 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] bg-[#0A0A0A]/30 backdrop-blur-sm transition-all duration-200"
              aria-label="Siguiente"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-5 right-8 z-20 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'w-5 h-1 bg-[#D4AF37]' : 'w-1 h-1 bg-white/25 hover:bg-white/50'
                }`}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

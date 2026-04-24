'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { BentoItem } from '@/lib/types'

interface BentoGridProps {
  items: BentoItem[]
}

export default function BentoGrid({ items }: BentoGridProps) {
  const [active, setActive] = useState(0)

  const next = useCallback(() => setActive(p => (p + 1) % items.length), [items.length])
  const prev = useCallback(() => setActive(p => (p - 1 + items.length) % items.length), [items.length])

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [items.length, next])

  if (items.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-12 py-16 md:py-32">

      {/* ── Desktop: grid estático ── */}
      <div className="hidden md:grid grid-cols-4 gap-6 h-[700px]">
        {items.map(item => (
          <div
            key={item.id}
            className={`${item.large ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2'} group relative overflow-hidden bg-[#111]`}
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              className={`object-cover ${item.large ? 'opacity-70' : 'opacity-50'} group-hover:scale-105 transition-transform duration-700`}
              sizes="50vw"
              unoptimized
            />
            <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
              <h3 className={`${item.large ? 'font-headline-lg' : 'font-headline-md'} text-white mb-2`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="font-body-md text-secondary mb-6 max-w-xs">{item.description}</p>
              )}
              <a className="font-label-caps text-primary border-b border-primary w-fit pb-1" href="#">
                {item.linkLabel}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile: hero carousel ── */}
      <div className="md:hidden relative h-[65vh] min-h-[420px] overflow-hidden">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== active}
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              className="object-cover opacity-70"
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 pb-16">
              <p className="font-label-caps text-[9px] tracking-[0.25em] text-[#D4AF37] mb-3">
                {`${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`}
              </p>
              <h3 className="font-label-caps text-[22px] tracking-[0.04em] text-white mb-3 leading-tight">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-white/55 text-[13px] font-light mb-5 max-w-xs leading-relaxed">
                  {item.description}
                </p>
              )}
              <a
                className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/40 w-fit pb-0.5"
                href="#"
              >
                {item.linkLabel}
              </a>
            </div>
          </div>
        ))}

        {/* Flechas */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#0A0A0A]/50 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200"
              aria-label="Anterior"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#0A0A0A]/50 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200"
              aria-label="Siguiente"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-5 h-1.5 bg-[#D4AF37]'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
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

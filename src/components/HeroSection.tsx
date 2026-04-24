'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { HeroSlide } from '@/lib/types'

interface HeroSectionProps {
  slides: HeroSlide[]
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const list = slides.length > 0 ? slides : []
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const goTo = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
    if (animating || index === active) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setActive(index)
      setAnimating(false)
    }, 600)
  }, [active, animating])

  const next = useCallback(() => {
    goTo((active + 1) % list.length, 'next')
  }, [active, list.length, goTo])

  const prev = useCallback(() => {
    goTo((active - 1 + list.length) % list.length, 'prev')
  }, [active, list.length, goTo])

  // Autoplay: 3s mobile / 5s desktop
  useEffect(() => {
    if (list.length <= 1) return
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const timer = setInterval(next, isMobile ? 3000 : 5000)
    return () => clearInterval(timer)
  }, [list.length, next])

  if (list.length === 0) return null

  const slide = list[active]
  const titleLines = slide.title.split('\n')

  return (
    <section className="relative h-[65vh] min-h-[450px] md:h-[75vh] md:min-h-[600px] max-h-[850px] w-full overflow-hidden flex items-center justify-center">

      {/* ── Slides de fondo ─────────────────────────────────────── */}
      {list.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== active}
        >
          <Image
            src={s.backgroundImage}
            alt={s.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-[#0A0A0A]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* ── Contenido del slide activo ──────────────────────────── */}
      <div
        key={active}
        className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-500 ${
          animating
            ? direction === 'next'
              ? 'opacity-0 translate-y-4'
              : 'opacity-0 -translate-y-4'
            : 'opacity-100 translate-y-0'
        }`}
      >
        <p
          className="font-label-caps text-[10px] tracking-[0.45em] text-[#D4AF37] mb-8"
          style={{ letterSpacing: '0.45em' }}
        >
          {slide.badge}
        </p>

        <h1
          className="font-headline-display text-white mb-8 leading-[0.92]"
          style={{
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontWeight: 200,
            letterSpacing: '-0.025em',
          }}
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h1>

        <p
          className="text-white/55 max-w-md mx-auto mb-12 font-light leading-relaxed"
          style={{ fontSize: '15px', letterSpacing: '0.01em' }}
        >
          {slide.subtitle}
        </p>

        <div className="flex justify-center">
          <button className="px-10 py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.25em] hover:bg-[#f2ca50] transition-colors duration-200">
            {slide.cta1Label}
          </button>
        </div>
      </div>

      {/* ── Controles de navegación (solo si hay más de 1 slide) ── */}
      {list.length > 1 && (
        <>
          {/* Flechas laterales — solo desktop */}
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center border border-white/15 text-white/40 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all duration-200 bg-[#0A0A0A]/30 backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center border border-white/15 text-white/40 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all duration-200 bg-[#0A0A0A]/30 backdrop-blur-sm"
            aria-label="Slide siguiente"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
          </button>

          {/* Dots indicadores */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {list.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i, i > active ? 'next' : 'prev')}
                className={`transition-all duration-300 rounded-full ${
                  i === active
                    ? 'w-6 h-1.5 bg-[#D4AF37]'
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Contador */}
          <div className="absolute top-8 right-8 z-20 hidden sm:flex items-center gap-2">
            <span className="font-label-caps text-[9px] tracking-[0.2em] text-white/50 tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
            </span>
          </div>
        </>
      )}

      {/* ── Scroll indicator ────────────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 z-10">
        <span className="font-label-caps text-[8px] tracking-[0.3em] text-white">SCROLL</span>
        <div className="w-px h-10 bg-white/40" />
      </div>

    </section>
  )
}

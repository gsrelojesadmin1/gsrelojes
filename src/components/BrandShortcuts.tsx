'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import type { BrandShortcut } from '@/lib/types'

interface BrandShortcutsProps {
  shortcuts?: BrandShortcut[]
}

export default function BrandShortcuts({ shortcuts = [] }: BrandShortcutsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bs-card', {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'back.out(1.7)',
        stagger: { amount: 0.4, from: 'center' },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  if (shortcuts.length === 0) return null

  return (
    <section className="py-16 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="flex flex-col items-center mb-10">
        <p className="font-label-caps text-[9px] tracking-[0.3em] text-white/25 mb-2">NAVEGACIÓN</p>
        <h2 className="font-label-caps text-[12px] tracking-[0.3em] text-[#D4AF37] text-center">
          COLECCIONES EXCLUSIVAS
        </h2>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 max-w-lg md:max-w-3xl mx-auto"
      >
        {shortcuts.map((shortcut, i) => (
          <ShortcutCard key={shortcut.id} shortcut={shortcut} index={i} />
        ))}
      </div>
    </section>
  )
}

function ShortcutCard({ shortcut, index }: { shortcut: BrandShortcut; index: number }) {
  const circleRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shine = shineRef.current
    if (!shine) return

    gsap.set(shine, { x: '-160%' })

    // Periodic shimmer sweep staggered by card index
    const tween = gsap.to(shine, {
      x: '160%',
      duration: 0.8,
      ease: 'power2.inOut',
      repeat: -1,
      repeatDelay: 4.5,
      delay: index * 1.1 + 1.5,
    })

    return () => tween.kill()
  }, [index])

  function handleMouseEnter() {
    gsap.to(circleRef.current, {
      scale: 1.1,
      boxShadow: '0 0 32px rgba(212,175,55,0.5), 0 0 8px rgba(212,175,55,0.2)',
      duration: 0.35,
      ease: 'power2.out',
    })
  }

  function handleMouseLeave() {
    gsap.to(circleRef.current, {
      scale: 1,
      boxShadow: '0 0 0px rgba(212,175,55,0)',
      duration: 0.45,
      ease: 'power2.inOut',
    })
  }

  return (
    <Link href={shortcut.link} className="bs-card flex flex-col items-center">
      <div
        ref={circleRef}
        className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-white/20 bg-[#111] cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={shortcut.image}
          alt={shortcut.name}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Shimmer sweep */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(108deg, transparent 25%, rgba(255,220,100,0.35) 50%, transparent 75%)',
          }}
        />
      </div>
    </Link>
  )
}

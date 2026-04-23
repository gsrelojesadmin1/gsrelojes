'use client'

import { useState, useEffect } from 'react'
import type { BrandShortcut } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface BrandShortcutsProps {
  shortcuts?: BrandShortcut[]
}

export default function BrandShortcuts({ shortcuts = [] }: BrandShortcutsProps) {
  const [activePair, setActivePair] = useState(0)

  // Chunk array into pairs for mobile
  const pairs = []
  for (let i = 0; i < shortcuts.length; i += 2) {
    pairs.push(shortcuts.slice(i, i + 2))
  }

  useEffect(() => {
    if (pairs.length <= 1) return
    const interval = setInterval(() => {
      setActivePair(prev => (prev + 1) % pairs.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [pairs.length])

  if (shortcuts.length === 0) return null

  return (
    <section className="py-16 px-6 lg:px-12 max-w-[1440px] mx-auto overflow-hidden">
      <div className="flex flex-col items-center mb-12">
        <h2 className="font-label-caps text-[12px] tracking-[0.3em] text-[#D4AF37] mb-2 text-center">COLECCIONES EXCLUSIVAS</h2>
        <p className="text-white/40 text-[11px] font-light tracking-widest uppercase">Navega por marca</p>
      </div>
      
      {/* ── DESKTOP: Todas las marcas ── */}
      <div className="hidden md:flex flex-wrap justify-center gap-16">
        {shortcuts.map(shortcut => (
          <ShortcutCard key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>

      {/* ── MOBILE: Slider de a 2 marcas ── */}
      <div className="md:hidden relative w-full h-[160px]">
        {pairs.map((pair, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 flex justify-center gap-8 transition-opacity duration-700 ${index === activePair ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            {pair.map(shortcut => (
              <ShortcutCard key={shortcut.id} shortcut={shortcut} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function ShortcutCard({ shortcut }: { shortcut: BrandShortcut }) {
  return (
    <Link href={shortcut.link} className="flex flex-col items-center group w-28 md:w-auto">
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-500">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10 duration-500" />
        <Image 
          src={shortcut.image} 
          alt={shortcut.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          unoptimized
        />
      </div>
      <span className="font-label-caps text-[10px] tracking-[0.2em] text-white/70 group-hover:text-[#D4AF37] transition-colors text-center w-full truncate px-2">
        {shortcut.name.toUpperCase()}
      </span>
    </Link>
  )
}

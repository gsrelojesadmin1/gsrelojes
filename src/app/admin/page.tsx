'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SiteData } from '@/lib/types'

const sections = [
  { href: '/admin/hero', label: 'Hero', icon: 'panorama', desc: 'Título, subtítulo, imagen de fondo y CTAs' },
  { href: '/admin/navbar', label: 'Navbar', icon: 'menu', desc: 'Nombre de marca y enlaces de navegación' },
  { href: '/admin/products', label: 'Productos', icon: 'inventory_2', desc: 'Catálogo completo con precios e imágenes' },
  { href: '/admin/footer', label: 'Footer', icon: 'vertical_align_bottom', desc: 'Links, copyright y redes sociales' },
]

export default function AdminDashboard() {
  const [data, setData] = useState<SiteData | null>(null)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-12">
        <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">PANEL DE CONTROL</p>
        <h1 className="text-white text-3xl font-light" style={{ letterSpacing: '-0.01em' }}>Dashboard</h1>
        <p className="text-white/35 text-sm mt-2 font-light">Gestiona el contenido de tu tienda desde aquí.</p>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-[#111] border border-white/8 p-6">
            <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/30 mb-2">PRODUCTOS</p>
            <p className="text-white text-3xl font-light tabular-nums">{data.products.length}</p>
          </div>
          <div className="bg-[#111] border border-white/8 p-6">
            <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/30 mb-2">LINKS NAV</p>
            <p className="text-white text-3xl font-light tabular-nums">{data.navbar.links.length}</p>
          </div>
          <div className="bg-[#111] border border-white/8 p-6">
            <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/30 mb-2">LINKS FOOTER</p>
            <p className="text-white text-3xl font-light tabular-nums">{data.footer.links.length}</p>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="grid grid-cols-2 gap-4">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="group bg-[#111] border border-white/8 p-7 hover:border-[#D4AF37]/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 group-hover:bg-[#D4AF37]/10 transition-colors">
                <span className="material-symbols-outlined text-white/40 group-hover:text-[#D4AF37] transition-colors" style={{ fontSize: '20px' }}>
                  {s.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-label-caps text-[11px] tracking-[0.15em] text-white/80 group-hover:text-white mb-2 transition-colors">
                  {s.label.toUpperCase()}
                </p>
                <p className="text-white/30 text-xs font-light leading-relaxed">{s.desc}</p>
              </div>
              <span className="material-symbols-outlined text-white/15 group-hover:text-[#D4AF37]/50 transition-colors" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

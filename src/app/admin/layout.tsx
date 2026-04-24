'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navGroups = [
  {
    label: null,
    items: [
      { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
    ],
  },
  {
    label: 'PUBLICIDAD',
    items: [
      { href: '/admin/publicidad', label: 'Publicidad', icon: 'campaign', exact: true },
      { href: '/admin/publicidad/announcements', label: 'Anuncios', icon: 'campaign' },
      { href: '/admin/publicidad/hero', label: 'Hero', icon: 'panorama' },
      { href: '/admin/publicidad/bento', label: 'Bento Grid', icon: 'grid_view' },
      { href: '/admin/publicidad/badges', label: 'Badges Confianza', icon: 'verified' },
      { href: '/admin/publicidad/shortcuts', label: 'Atajos Marcas', icon: 'ads_click' },
    ],
  },
  {
    label: 'TIENDA',
    items: [
      { href: '/admin/navbar', label: 'Navbar', icon: 'menu' },
      { href: '/admin/products', label: 'Productos', icon: 'inventory_2' },
      { href: '/admin/categories', label: 'Categorías', icon: 'account_tree' },
      { href: '/admin/footer', label: 'Footer', icon: 'vertical_align_bottom' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const closeMobile = () => setMobileOpen(false)

  const SidebarContent = () => (
    <>
      <div className="px-5 py-6 border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-0.5">GS RELOJES</p>
          <p className="font-label-caps text-[8px] tracking-[0.2em] text-white/25">ADMINISTRACIÓN</p>
        </div>
        <button
          onClick={closeMobile}
          className="lg:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white"
          aria-label="Cerrar menú"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto" aria-label="Navegación del admin">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {group.label && (
              <p className="font-label-caps text-[8px] tracking-[0.3em] text-white/20 px-3 mb-1.5">
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 px-3 py-3 mb-0.5 transition-all duration-200 relative min-h-[44px] ${
                    active ? 'text-white bg-white/5' : 'text-white/35 hover:text-white/70 hover:bg-white/3'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4AF37]" />
                  )}
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span className="font-label-caps text-[10px] tracking-[0.12em]">{item.label.toUpperCase()}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-white/8">
        <Link
          href="/"
          target="_blank"
          onClick={closeMobile}
          className="flex items-center gap-3 px-3 py-3 text-white/25 hover:text-white/60 transition-colors min-h-[44px]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
          <span className="font-label-caps text-[9px] tracking-[0.12em]">VER TIENDA</span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">

      {/* ── Sidebar desktop (siempre visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-64 flex-none bg-[#080808] border-r border-white/8 flex-col sticky top-0 h-screen overflow-y-auto admin-scroll">
        <SidebarContent />
      </aside>

      {/* ── Drawer móvil ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#080808] border-r border-white/8 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar móvil */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-[#080808] border-b border-white/8">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
          </button>
          <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37]">GS RELOJES</p>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-white/30 hover:text-white/60 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto admin-scroll">
          {children}
        </main>
      </div>
    </div>
  )
}

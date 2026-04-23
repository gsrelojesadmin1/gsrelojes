'use client'

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

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      <aside className="w-64 flex-none bg-[#080808] border-r border-white/8 flex flex-col sticky top-0 h-screen overflow-y-auto admin-scroll">
        <div className="px-6 py-8 border-b border-white/8">
          <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-1">GS RELOJES</p>
          <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/25">PANEL DE ADMINISTRACIÓN</p>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Navegación del admin">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              {group.label && (
                <p className="font-label-caps text-[8px] tracking-[0.3em] text-white/20 px-4 mb-2">
                  {group.label}
                </p>
              )}
              {group.items.map(item => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 mb-0.5 transition-all duration-200 relative ${
                      active ? 'text-white bg-white/5' : 'text-white/35 hover:text-white/70 hover:bg-white/3'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4AF37]" />
                    )}
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{item.icon}</span>
                    <span className="font-label-caps text-[10px] tracking-[0.12em]">{item.label.toUpperCase()}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-white/25 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
            <span className="font-label-caps text-[9px] tracking-[0.12em]">VER TIENDA</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto admin-scroll">
        {children}
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/hero', label: 'Hero', icon: 'panorama' },
  { href: '/admin/navbar', label: 'Navbar', icon: 'menu' },
  { href: '/admin/products', label: 'Productos', icon: 'inventory_2' },
  { href: '/admin/categories', label: 'Categorías', icon: 'account_tree' },
  { href: '/admin/footer', label: 'Footer', icon: 'vertical_align_bottom' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      <aside className="w-64 flex-none bg-[#080808] border-r border-white/8 flex flex-col sticky top-0 h-screen overflow-y-auto admin-scroll">
        <div className="px-6 py-8 border-b border-white/8">
          <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-1">HOROLOGICAL</p>
          <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-3">EXCELLENCE</p>
          <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/25">ADMIN PANEL</p>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Admin navigation">
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mb-1 transition-all duration-200 relative ${
                  isActive ? 'text-white bg-white/5' : 'text-white/35 hover:text-white/70 hover:bg-white/3'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D4AF37]" />
                )}
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                <span className="font-label-caps text-[10px] tracking-[0.12em]">{item.label.toUpperCase()}</span>
              </Link>
            )
          })}
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

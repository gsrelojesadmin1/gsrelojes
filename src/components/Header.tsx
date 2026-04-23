'use client'

import { useCart } from '@/context/CartContext'
import type { NavbarData } from '@/lib/types'

interface HeaderProps {
  navbar: NavbarData
}

export default function Header({ navbar }: HeaderProps) {
  const { totalItems, openCart } = useCart()

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/8 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-8 lg:px-12 h-[72px]">

        {/* Brand */}
        <a href="/" className="font-label-caps text-[11px] tracking-[0.35em] text-[#D4AF37] hover:text-[#f2ca50] transition-colors">
          {navbar.brandName}
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          {navbar.links.map((link, idx) => (
            <a
              key={link.id}
              href={link.href}
              className={`font-label-caps text-[10px] tracking-[0.18em] transition-colors duration-300 pb-0.5 ${
                idx === 0
                  ? 'text-white border-b border-white/50'
                  : 'text-white/40 hover:text-white/80 border-b border-transparent hover:border-white/20'
              }`}
            >
              {link.label.toUpperCase()}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-2 border-b border-white/15 pb-1">
            <span className="material-symbols-outlined text-white/35" style={{ fontSize: '16px' }}>search</span>
            <input
              className="bg-transparent text-[10px] uppercase tracking-widest text-white w-36 placeholder:text-white/25 outline-none"
              placeholder="Search pieces"
              type="search"
              aria-label="Search"
            />
          </div>

          <button className="text-white/40 hover:text-white transition-colors p-1" aria-label="Wishlist">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>favorite</span>
          </button>

          <button
            onClick={openCart}
            className="relative text-white/40 hover:text-white transition-colors p-1"
            aria-label={`Open cart, ${totalItems} items`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_bag</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          <button className="text-white/40 hover:text-white transition-colors p-1" aria-label="Account">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
          </button>
        </div>
      </div>
    </header>
  )
}

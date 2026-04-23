'use client'

import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useEffect } from 'react'

export default function CartDrawer() {
  const { items, isOpen, totalPrice, closeCart, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-[440px] bg-[#080808] border-l border-white/8 z-[101] flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-white/8">
          <div>
            <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37]">YOUR COLLECTION</p>
            <p className="text-white/40 text-[11px] mt-1 font-light">
              {items.length === 0 ? 'No pieces selected' : `${items.reduce((s, i) => s + i.quantity, 0)} ${items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'piece' : 'pieces'}`}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <span className="material-symbols-outlined text-white/15" style={{ fontSize: '52px' }}>shopping_bag</span>
              <div>
                <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/30 mb-2">YOUR COLLECTION IS EMPTY</p>
                <p className="text-white/20 text-xs font-light">Discover our curated selection of timepieces</p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 font-label-caps text-[10px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/50 pb-0.5 hover:border-[#D4AF37] transition-colors"
              >
                EXPLORE PIECES
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map(item => (
                <li key={item.id} className="flex gap-5 px-8 py-6">
                  <div className="relative w-[64px] h-[80px] flex-none bg-[#111] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-caps text-[9px] tracking-[0.18em] text-[#D4AF37] mb-1">{item.brand}</p>
                    <p className="text-white text-[13px] font-light leading-snug mb-2">{item.name}</p>
                    <p className="text-white/50 text-sm tabular-nums mb-3">${item.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-white/12">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition-colors text-sm"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-white text-xs tabular-nums border-x border-white/12">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition-colors text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/25 hover:text-white/60 transition-colors"
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/8 px-8 py-8">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-label-caps text-[10px] tracking-[0.15em] text-white/40">SUBTOTAL</span>
              <span className="text-white text-xl font-light tabular-nums">${totalPrice.toLocaleString()}</span>
            </div>
            <p className="font-label-caps text-[9px] tracking-[0.12em] text-white/25 mb-8">COMPLIMENTARY WORLDWIDE SHIPPING</p>
            <button className="w-full py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[11px] tracking-[0.22em] hover:bg-[#f2ca50] transition-colors mb-3">
              PROCEED TO CHECKOUT
            </button>
            <button
              onClick={closeCart}
              className="w-full py-3 border border-white/12 text-white/50 font-label-caps text-[10px] tracking-[0.18em] hover:border-white/25 hover:text-white/80 transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

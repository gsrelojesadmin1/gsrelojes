'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { toastRemovedFromCart } from '@/lib/toast'

const CheckoutMap = dynamic(() => import('./CheckoutMap'), { ssr: false })

export default function CartDrawer() {
  const { items, isOpen, totalPrice, closeCart, removeItem, updateQuantity } = useCart()
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    factura: '',
    telefono: '',
    location: null as { lat: number; lng: number } | null,
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setStep('cart')
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  const handleCheckoutSubmit = () => {
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.factura) {
      alert('Por favor, completa todos los campos requeridos.')
      return
    }
    let msg = `*NUEVO PEDIDO GS RELOJES*%0A%0A`
    msg += `*Cliente:* ${formData.nombre} ${formData.apellido}%0A`
    msg += `*RUC/CI:* ${formData.factura}%0A`
    msg += `*Teléfono:* ${formData.telefono}%0A%0A*PRODUCTOS:*%0A`
    items.forEach(i => {
      msg += `- ${i.quantity}x ${i.name} (Mod: ${i.sku}) -> ₲${i.price.toLocaleString('es-PY')}%0A`
    })
    msg += `%0A*TOTAL:* ₲${totalPrice.toLocaleString('es-PY')}%0A%0A`
    msg += formData.location
      ? `*Ubicación:* https://www.google.com/maps/search/?api=1&query=${formData.location.lat},${formData.location.lng}`
      : `*Ubicación:* No proporcionada`
    window.open(`https://wa.me/595981123456?text=${msg}`, '_blank')
    closeCart()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#070707] z-[101] flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontSize: 18 }}>
              shopping_bag
            </span>
            <div>
              <p className="font-label-caps text-[11px] tracking-[0.28em] text-white">
                TU SELECCIÓN
              </p>
              <p className="text-white/30 text-[10px] mt-0.5 font-light tracking-wider">
                {totalQty === 0
                  ? 'Vacío'
                  : `${totalQty} ${totalQty === 1 ? 'pieza' : 'piezas'}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors"
            aria-label="Cerrar carrito"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <ul>
              {items.map((item, idx) => {
                const displayPrice = item.salePrice ?? item.price
                return (
                  <li
                    key={item.id}
                    className={`flex gap-4 px-7 py-5 ${idx < items.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                  >
                    {/* Image */}
                    <Link href={`/product/${item.slug}`} onClick={closeCart} className="flex-none">
                      <div className="relative w-[56px] h-[70px] bg-[#111] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized={item.image.startsWith('/uploads/')}
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-label-caps text-[8px] tracking-[0.2em] text-[#D4AF37]/70 mb-0.5">
                        {item.brand}
                      </p>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-white/85 text-[12px] font-light leading-snug hover:text-white transition-colors line-clamp-2 block mb-2"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-center justify-between">
                        {/* Qty stepper */}
                        <div className="flex items-center border border-white/[0.08]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors text-[13px]"
                            aria-label="Disminuir"
                          >
                            −
                          </button>
                          <span className="w-7 h-6 flex items-center justify-center text-white text-[11px] tabular-nums border-x border-white/[0.08]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors text-[13px]"
                            aria-label="Aumentar"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-white/60 text-[12px] tabular-nums font-light">
                            ₲{(displayPrice * item.quantity).toLocaleString('es-PY')}
                          </span>
                          <button
                            onClick={() => { toastRemovedFromCart(item.name); removeItem(item.id) }}
                            className="text-white/20 hover:text-red-400/70 transition-colors"
                            aria-label="Eliminar"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                              close
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Footer / CTA ── */}
        {items.length > 0 && step === 'cart' && (
          <div className="border-t border-white/[0.06] px-7 pt-5 pb-7">
            {/* Subtotal */}
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-label-caps text-[9px] tracking-[0.2em] text-white/30">SUBTOTAL</span>
              <span className="text-white text-[20px] font-light tabular-nums">
                ₲{totalPrice.toLocaleString('es-PY')}
              </span>
            </div>
            <p className="font-label-caps text-[8px] tracking-[0.15em] text-white/20 mb-6">
              ENVÍO COORDINADO AL MOMENTO DEL PEDIDO
            </p>

            {/* Divider with label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="flex-1 h-px bg-white/[0.06]" />
              <span className="font-label-caps text-[8px] tracking-[0.15em] text-white/15">
                PEDIDO VÍA WHATSAPP
              </span>
              <span className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <button
              onClick={() => setStep('checkout')}
              className="w-full py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.25em] hover:bg-[#f2ca50] active:scale-[0.99] transition-all duration-150 mb-3 flex items-center justify-center gap-2"
            >
              <span>REALIZAR PEDIDO</span>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                arrow_forward
              </span>
            </button>

            <button
              onClick={closeCart}
              className="w-full py-3 text-white/30 font-label-caps text-[9px] tracking-[0.2em] hover:text-white/60 transition-colors"
            >
              SEGUIR EXPLORANDO
            </button>
          </div>
        )}

        {/* ── Checkout Step ── */}
        {step === 'checkout' && (
          <div className="absolute inset-0 bg-[#070707] z-10 flex flex-col">
            {/* Checkout header */}
            <div className="flex items-center justify-between px-7 py-6 border-b border-white/[0.06]">
              <button
                onClick={() => setStep('cart')}
                className="flex items-center gap-1.5 text-white/30 hover:text-[#D4AF37] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
                <span className="font-label-caps text-[9px] tracking-wider">VOLVER</span>
              </button>
              <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37]">
                DATOS DE ENVÍO
              </p>
              <button onClick={closeCart} className="text-white/20 hover:text-white/50 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="NOMBRE *">
                  <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className={inputCls} />
                </Field>
                <Field label="APELLIDO *">
                  <input type="text" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="FACTURA (RUC / CI) *">
                <input type="text" value={formData.factura} onChange={e => setFormData({ ...formData, factura: e.target.value })} className={inputCls} />
              </Field>
              <Field label="NÚMERO DE TELÉFONO *">
                <input type="tel" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="+595..." className={inputCls} />
              </Field>
              <Field label="UBICACIÓN (OPCIONAL — HAZ CLIC EN EL MAPA)">
                <CheckoutMap onLocationSelect={(lat, lng) => setFormData({ ...formData, location: { lat, lng } })} />
                {formData.location && (
                  <p className="text-[10px] text-[#D4AF37] mt-2 flex items-center gap-1 font-light">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                    Ubicación seleccionada
                  </p>
                )}
              </Field>

              {/* Order summary */}
              <div className="border border-white/[0.06] p-4 space-y-2">
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/25 mb-3">RESUMEN</p>
                {items.map(i => (
                  <div key={i.id} className="flex justify-between text-[11px]">
                    <span className="text-white/40 font-light truncate flex-1 mr-4">
                      {i.quantity}× {i.name}
                    </span>
                    <span className="text-white/50 tabular-nums flex-none">
                      ₲{((i.salePrice ?? i.price) * i.quantity).toLocaleString('es-PY')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                  <span className="font-label-caps text-[9px] tracking-wider text-white/30">TOTAL</span>
                  <span className="text-white font-light tabular-nums">₲{totalPrice.toLocaleString('es-PY')}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] px-7 py-5">
              <button
                onClick={handleCheckoutSubmit}
                className="w-full py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.22em] hover:bg-[#f2ca50] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 0C5.385 0 0 5.385 0 12.03c0 2.122.55 4.195 1.597 6.02L.15 23.4l5.485-1.442A11.968 11.968 0 0 0 12.032 24c6.645 0 12.03-5.385 12.03-12.03S18.677 0 12.031 0zm0 21.996a9.96 9.96 0 0 1-5.083-1.39l-.364-.216-3.774.99 1.01-3.68-.237-.378A9.957 9.957 0 0 1 2.003 12.03c0-5.531 4.5-10.03 10.028-10.03 5.53 0 10.03 4.499 10.03 10.03s-4.5 10.028-10.03 10.026zm5.503-7.514c-.302-.15-1.785-.882-2.062-.982-.276-.101-.478-.15-.68.15s-.781.982-.958 1.183c-.176.202-.353.227-.655.076a8.212 8.212 0 0 1-2.42-1.493 9.074 9.074 0 0 1-1.674-2.083c-.176-.302-.019-.465.132-.616.136-.136.302-.352.453-.528.151-.176.201-.302.302-.503.101-.202.05-.378-.026-.529-.075-.15-.68-1.637-.932-2.241-.246-.59-.496-.51-.68-.52-.176-.01-.378-.01-.58-.01-.202 0-.528.075-.805.378-.277.302-1.057 1.031-1.057 2.516s1.082 2.92 1.233 3.12c.15.202 2.128 3.249 5.155 4.553.72.31 1.28.496 1.718.635.723.23 1.382.197 1.901.12.58-.086 1.785-.73 2.036-1.434.252-.705.252-1.31.176-1.435-.075-.126-.277-.202-.579-.353z" />
                </svg>
                FINALIZAR POR WHATSAPP
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

const inputCls =
  'w-full bg-[#111] border border-white/[0.08] px-3 py-2.5 text-[12px] text-white/80 outline-none focus:border-[#D4AF37]/30 transition-colors placeholder:text-white/20 font-light'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-label-caps text-[8px] tracking-[0.2em] text-white/30 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center py-20">
      {/* Icon */}
      <div className="relative">
        <div className="w-16 h-16 border border-white/[0.06] flex items-center justify-center">
          <span className="material-symbols-outlined text-white/15" style={{ fontSize: 28 }}>
            shopping_bag
          </span>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center">
          <span className="text-[#D4AF37] text-[9px]">0</span>
        </div>
      </div>

      <div>
        <p className="font-label-caps text-[11px] tracking-[0.25em] text-white/35 mb-2">
          SIN PIEZAS
        </p>
        <p className="text-white/20 text-[11px] font-light leading-relaxed max-w-[200px] mx-auto">
          Tu colección está vacía. Descubre nuestras piezas curadas.
        </p>
      </div>

      <button
        onClick={onClose}
        className="mt-1 flex items-center gap-2 pb-0.5 border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors group"
      >
        <span className="font-label-caps text-[9px] tracking-[0.22em] text-[#D4AF37]/70 group-hover:text-[#D4AF37] transition-colors">
          EXPLORAR PIEZAS
        </span>
        <span
          className="material-symbols-outlined text-[#D4AF37]/50 group-hover:text-[#D4AF37] transition-colors"
          style={{ fontSize: 12 }}
        >
          arrow_forward
        </span>
      </button>
    </div>
  )
}

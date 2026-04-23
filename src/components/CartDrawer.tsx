'use client'

import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const CheckoutMap = dynamic(() => import('./CheckoutMap'), { ssr: false })

export default function CartDrawer() {
  const { items, isOpen, totalPrice, closeCart, removeItem, updateQuantity } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    factura: '',
    telefono: '',
    location: null as { lat: number, lng: number } | null
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setStep('cart') // Resetear al abrir
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSeguirComprando = () => {
    closeCart()
    router.push('/')
  }

  const handleCheckoutSubmit = () => {
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.factura) {
      alert('Por favor, completa todos los campos requeridos.')
      return
    }

    let message = `*NUEVO PEDIDO GS RELOJES*%0A%0A`
    message += `*Cliente:* ${formData.nombre} ${formData.apellido}%0A`
    message += `*RUC/CI:* ${formData.factura}%0A`
    message += `*Teléfono:* ${formData.telefono}%0A%0A`
    
    message += `*PRODUCTOS:*%0A`
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (Mod: ${item.sku}) -> ₲${item.price.toLocaleString('es-PY')}%0A`
    })
    
    message += `%0A*TOTAL:* ₲${totalPrice.toLocaleString('es-PY')}%0A%0A`
    
    if (formData.location) {
      message += `*Ubicación:* https://www.google.com/maps/search/?api=1&query=${formData.location.lat},${formData.location.lng}`
    } else {
      message += `*Ubicación:* No proporcionada`
    }

    window.open(`https://wa.me/595981123456?text=${message}`, '_blank')
    closeCart()
  }

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
            <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37]">TU SELECCIÓN</p>
            <p className="text-white/40 text-[11px] mt-1 font-light">
              {items.length === 0 ? 'Sin piezas seleccionadas' : `${items.reduce((s, i) => s + i.quantity, 0)} ${items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'pieza' : 'piezas'}`}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            aria-label="Cerrar carrito"
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
                <p className="font-label-caps text-[10px] tracking-[0.2em] text-white/30 mb-2">TU COLECCIÓN ESTÁ VACÍA</p>
                <p className="text-white/20 text-xs font-light">Descubre nuestra selección curada de piezas</p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 font-label-caps text-[10px] tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/50 pb-0.5 hover:border-[#D4AF37] transition-colors"
              >
                EXPLORAR PIEZAS
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
                    <p className="text-white/50 text-sm tabular-nums mb-3">₲{item.price.toLocaleString('es-PY')}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-white/12">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition-colors text-sm"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-white text-xs tabular-nums border-x border-white/12">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition-colors text-sm"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/25 hover:text-white/60 transition-colors"
                        aria-label="Quitar del carrito"
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
        {items.length > 0 && step === 'cart' && (
          <div className="border-t border-white/8 px-8 py-8">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-label-caps text-[10px] tracking-[0.15em] text-white/40">SUBTOTAL</span>
              <span className="text-white text-xl font-light tabular-nums">₲{totalPrice.toLocaleString('es-PY')}</span>
            </div>
            <p className="font-label-caps text-[9px] tracking-[0.12em] text-white/25 mb-8">ENVÍO MUNDIAL GRATUITO</p>
            <button 
              onClick={() => setStep('checkout')}
              className="w-full py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[11px] tracking-[0.22em] hover:bg-[#f2ca50] transition-colors mb-3"
            >
              REALIZAR PEDIDO
            </button>
            <button
              onClick={handleSeguirComprando}
              className="w-full py-3 border border-white/12 text-white/50 font-label-caps text-[10px] tracking-[0.18em] hover:border-white/25 hover:text-white/80 transition-colors"
            >
              SEGUIR COMPRANDO
            </button>
          </div>
        )}

        {/* Checkout Step */}
        {step === 'checkout' && (
          <div className="absolute inset-0 bg-[#080808] z-10 flex flex-col pt-20">
            <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-7 border-b border-white/8 bg-[#080808]">
              <button onClick={() => setStep('cart')} className="text-white/40 hover:text-[#D4AF37] flex items-center gap-1 font-label-caps text-[10px] tracking-wider transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                VOLVER
              </button>
              <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37]">DATOS DE ENVÍO</p>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">NOMBRE *</label>
                  <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#111] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/40" />
                </div>
                <div>
                  <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">APELLIDO *</label>
                  <input type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="w-full bg-[#111] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/40" />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">FACTURA (RUC / CI) *</label>
                <input type="text" value={formData.factura} onChange={e => setFormData({...formData, factura: e.target.value})} className="w-full bg-[#111] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/40" />
              </div>
              <div>
                <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">NÚMERO DE TELÉFONO *</label>
                <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="+595..." className="w-full bg-[#111] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/40" />
              </div>
              <div>
                <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">UBICACIÓN (HAZ CLIC EN EL MAPA)</label>
                <CheckoutMap onLocationSelect={(lat, lng) => setFormData({...formData, location: {lat, lng}})} />
                {formData.location && (
                  <p className="text-[10px] text-[#D4AF37] mt-2 flex items-center gap-1 font-light">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                    Ubicación seleccionada
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-white/8 p-8 bg-[#080808]">
               <button 
                onClick={handleCheckoutSubmit}
                className="w-full py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[11px] tracking-[0.22em] hover:bg-[#f2ca50] transition-colors flex items-center justify-center gap-2"
              >
                FINALIZAR PEDIDO EN WHATSAPP
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 0C5.385 0 0 5.385 0 12.03c0 2.122.55 4.195 1.597 6.02L.15 23.4l5.485-1.442A11.968 11.968 0 0 0 12.032 24c6.645 0 12.03-5.385 12.03-12.03S18.677 0 12.031 0zm0 21.996a9.96 9.96 0 0 1-5.083-1.39l-.364-.216-3.774.99 1.01-3.68-.237-.378A9.957 9.957 0 0 1 2.003 12.03c0-5.531 4.5-10.03 10.028-10.03 5.53 0 10.03 4.499 10.03 10.03s-4.5 10.028-10.03 10.026zm5.503-7.514c-.302-.15-1.785-.882-2.062-.982-.276-.101-.478-.15-.68.15s-.781.982-.958 1.183c-.176.202-.353.227-.655.076a8.212 8.212 0 0 1-2.42-1.493 9.074 9.074 0 0 1-1.674-2.083c-.176-.302-.019-.465.132-.616.136-.136.302-.352.453-.528.151-.176.201-.302.302-.503.101-.202.05-.378-.026-.529-.075-.15-.68-1.637-.932-2.241-.246-.59-.496-.51-.68-.52-.176-.01-.378-.01-.58-.01-.202 0-.528.075-.805.378-.277.302-1.057 1.031-1.057 2.516s1.082 2.92 1.233 3.12c.15.202 2.128 3.249 5.155 4.553.72.31 1.28.496 1.718.635.723.23 1.382.197 1.901.12.58-.086 1.785-.73 2.036-1.434.252-.705.252-1.31.176-1.435-.075-.126-.277-.202-.579-.353z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

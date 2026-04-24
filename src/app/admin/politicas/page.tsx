'use client'

import { useState, useEffect } from 'react'
import type { SiteData } from '@/lib/types'

export default function AdminPoliticasPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [warranty, setWarranty] = useState('')
  const [shipping, setShipping] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then((d: SiteData) => {
        setData(d)
        setWarranty(d.policyDefaults?.warranty ?? '')
        setShipping(d.policyDefaults?.shipping ?? '')
      })
      .catch(() => setError('Error cargando datos'))
  }, [])

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    setError('')
    try {
      const updated: SiteData = { ...data, policyDefaults: { warranty, shipping } }
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error()
      setData(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  if (!data) return <div className="p-4 text-white/30 text-sm">Cargando...</div>

  return (
    <div className="p-4 md:p-10 max-w-2xl">
      <div className="mb-8">
        <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">ADMIN / POLÍTICAS</p>
        <h1 className="text-white text-2xl font-light">Textos Predefinidos</h1>
        <p className="text-white/30 text-sm mt-1 font-light">
          Estos textos se muestran en todos los productos que no tienen texto propio configurado.
        </p>
      </div>

      {error && <p className="mb-4 text-red-400 text-xs">{error}</p>}
      {saved && <p className="mb-4 text-green-400/80 font-label-caps text-[10px] tracking-wider">✓ GUARDADO</p>}

      <div className="space-y-6">

        {/* Garantía */}
        <section className="bg-[#0d0d0d] border border-white/8 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontSize: 18 }}>verified</span>
            <p className="font-label-caps text-[10px] tracking-[0.2em] text-white">GARANTÍA — TEXTO PREDEFINIDO</p>
          </div>
          <p className="text-white/30 text-[11px] font-light mb-3 leading-relaxed">
            Aparece en la sección <span className="text-white/50">Garantía</span> de los productos que no tienen texto propio.
            Si ningún producto tiene texto ni hay predefinido, el botón no se muestra.
          </p>
          <textarea
            rows={5}
            value={warranty}
            onChange={e => setWarranty(e.target.value)}
            placeholder="Ej: Todos nuestros relojes cuentan con garantía internacional de 2 años contra defectos de fabricación. La garantía cubre piezas y mano de obra..."
            className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#D4AF37]/40 resize-none placeholder:text-white/20 leading-relaxed"
          />
          <p className="mt-2 text-white/20 text-[10px] font-light">
            {warranty.length} caracteres
          </p>
        </section>

        {/* Envío y Devoluciones */}
        <section className="bg-[#0d0d0d] border border-white/8 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontSize: 18 }}>local_shipping</span>
            <p className="font-label-caps text-[10px] tracking-[0.2em] text-white">ENVÍO Y DEVOLUCIONES — TEXTO PREDEFINIDO</p>
          </div>
          <p className="text-white/30 text-[11px] font-light mb-3 leading-relaxed">
            Aparece en la sección <span className="text-white/50">Envío y Devoluciones</span> de los productos que no tienen texto propio.
          </p>
          <textarea
            rows={5}
            value={shipping}
            onChange={e => setShipping(e.target.value)}
            placeholder="Ej: Envío gratuito en todo el país. Entregas en 3-5 días hábiles en embalaje de lujo. Devoluciones gratuitas dentro de los 14 días con reembolso completo..."
            className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#D4AF37]/40 resize-none placeholder:text-white/20 leading-relaxed"
          />
          <p className="mt-2 text-white/20 text-[10px] font-light">
            {shipping.length} caracteres
          </p>
        </section>

      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-white/20 text-[10px] font-light font-label-caps tracking-wider">
          Los cambios se aplican de inmediato a todos los productos.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.18em] hover:bg-[#f2ca50] transition-colors disabled:opacity-30"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR TEXTOS'}
        </button>
      </div>
    </div>
  )
}

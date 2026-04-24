'use client'

import { useState, useEffect } from 'react'
import type { SiteData, FeatureBadge } from '@/lib/types'

export default function BadgesAdminPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => {
        if (!d.featureBadges) {
          d.featureBadges = [
            { id: '1', icon: 'local_shipping', title: 'ENVÍO GRATIS', description: 'En todo el mundo' },
            { id: '2', icon: 'verified', title: 'GARANTÍA OFICIAL', description: '2 Años de cobertura' },
            { id: '3', icon: 'security', title: 'PAGO SEGURO', description: '100% Protegido' },
            { id: '4', icon: 'support_agent', title: 'SOPORTE 24/7', description: 'Asistencia VIP' }
          ]
        }
        setData(d)
      })
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      alert('Guardado exitosamente')
    } catch {
      alert('Error al guardar')
    }
    setSaving(false)
  }

  const updateBadge = (id: string, field: keyof FeatureBadge, value: string) => {
    if (!data) return
    setData({
      ...data,
      featureBadges: data.featureBadges?.map(b => b.id === id ? { ...b, [field]: value } : b)
    })
  }

  if (!data) return <div className="p-8 text-white/50 font-label-caps text-[10px]">Cargando...</div>

  return (
    <div className="p-4 lg:p-12 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-12">
        <div>
          <h1 className="font-label-caps text-[14px] tracking-[0.3em] text-[#D4AF37] mb-2">BADGES DE CONFIANZA</h1>
          <p className="text-white/40 text-[11px] font-light">Edita los iconos y textos de los beneficios</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] px-6 py-3 hover:bg-[#f2ca50] transition-colors disabled:opacity-50"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(data.featureBadges || []).map((badge, i) => (
          <div key={badge.id} className="bg-[#111] border border-white/10 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-label-caps text-[10px] text-[#D4AF37]">BADGE {i + 1}</span>
            </div>
            <div>
              <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">ICONO (MATERIAL SYMBOL)</label>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#D4AF37]">{badge.icon}</span>
                <input
                  type="text"
                  value={badge.icon}
                  onChange={e => updateBadge(badge.id, 'icon', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none"
                  placeholder="Ej: local_shipping"
                />
              </div>
              <p className="text-[9px] text-white/20 mt-1">Nombres de Google Material Symbols</p>
            </div>
            <div>
              <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">TÍTULO</label>
              <input
                type="text"
                value={badge.title}
                onChange={e => updateBadge(badge.id, 'title', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none uppercase font-label-caps"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">DESCRIPCIÓN</label>
              <input
                type="text"
                value={badge.description}
                onChange={e => updateBadge(badge.id, 'description', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import type { SiteData } from '@/lib/types'

export default function AnnouncementsAdminPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => {
        if (!d.announcements) {
          d.announcements = ['NUEVA COLECCIÓN DE OTOÑO', 'ENVÍO GRATIS A TODO EL MUNDO', 'DESCUBRE LA EDICIÓN LIMITADA']
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

  const addAnnouncement = () => {
    if (!data) return
    setData({
      ...data,
      announcements: [...(data.announcements || []), 'NUEVO MENSAJE']
    })
  }

  const updateAnnouncement = (index: number, value: string) => {
    if (!data) return
    const newAnnouncements = [...(data.announcements || [])]
    newAnnouncements[index] = value
    setData({ ...data, announcements: newAnnouncements })
  }

  const removeAnnouncement = (index: number) => {
    if (!data) return
    const newAnnouncements = [...(data.announcements || [])]
    newAnnouncements.splice(index, 1)
    setData({ ...data, announcements: newAnnouncements })
  }

  if (!data) return <div className="p-8 text-white/50 font-label-caps text-[10px]">Cargando...</div>

  return (
    <div className="p-8 lg:p-12 max-w-4xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-label-caps text-[14px] tracking-[0.3em] text-[#D4AF37] mb-2">ANUNCIOS SUPERIORES</h1>
          <p className="text-white/40 text-[11px] font-light">Edita los mensajes que se deslizan en la barra superior</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] px-6 py-3 hover:bg-[#f2ca50] transition-colors disabled:opacity-50"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>

      <div className="bg-[#111] border border-white/10 p-6 flex flex-col gap-4">
        {(data.announcements || []).map((msg, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-label-caps text-[10px] text-[#D4AF37] w-12 text-right">{i + 1}.</span>
            <input
              type="text"
              value={msg}
              onChange={e => updateAnnouncement(i, e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none uppercase font-label-caps"
              placeholder="Ej: NUEVA COLECCIÓN"
            />
            <button
              onClick={() => removeAnnouncement(i)}
              className="w-9 h-9 flex items-center justify-center border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
              title="Eliminar mensaje"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
          </div>
        ))}

        <button
          onClick={addAnnouncement}
          className="mt-4 border border-dashed border-[#D4AF37]/40 text-[#D4AF37] font-label-caps text-[10px] tracking-[0.2em] py-3 hover:bg-[#D4AF37]/5 transition-colors"
        >
          + AÑADIR NUEVO MENSAJE
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import type { SiteData, BrandShortcut } from '@/lib/types'
import Image from 'next/image'

export default function ShortcutsAdminPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => {
        if (!d.brandShortcuts) {
          d.brandShortcuts = []
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

  const addShortcut = () => {
    if (!data) return
    setData({
      ...data,
      brandShortcuts: [
        ...(data.brandShortcuts || []),
        { id: Date.now().toString(), name: 'NUEVA MARCA', image: '', link: '/buscar?q=marca' }
      ]
    })
  }

  const updateShortcut = (id: string, field: keyof BrandShortcut, value: string) => {
    if (!data) return
    setData({
      ...data,
      brandShortcuts: data.brandShortcuts?.map(s => s.id === id ? { ...s, [field]: value } : s)
    })
  }

  const removeShortcut = (id: string) => {
    if (!data) return
    if (confirm('¿Eliminar este atajo?')) {
      setData({
        ...data,
        brandShortcuts: data.brandShortcuts?.filter(s => s.id !== id)
      })
    }
  }

  if (!data) return <div className="p-8 text-white/50 font-label-caps text-[10px]">Cargando...</div>

  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-label-caps text-[14px] tracking-[0.3em] text-[#D4AF37] mb-2">ATAJOS DE MARCAS</h1>
          <p className="text-white/40 text-[11px] font-light">Gestiona las colecciones exclusivas de la portada</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={addShortcut}
            className="border border-[#D4AF37]/30 text-[#D4AF37] font-label-caps text-[10px] tracking-[0.2em] px-6 py-3 hover:bg-[#D4AF37]/10 transition-colors"
          >
            AÑADIR ATAJO
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] px-6 py-3 hover:bg-[#f2ca50] transition-colors disabled:opacity-50"
          >
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(data.brandShortcuts || []).map((shortcut) => (
          <div key={shortcut.id} className="bg-[#111] border border-white/10 p-6 flex flex-col gap-4 relative group">
            <button
              onClick={() => removeShortcut(shortcut.id)}
              className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            </button>

            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-white/10 overflow-hidden relative">
                {shortcut.image ? (
                  <Image src={shortcut.image} alt={shortcut.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>image</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">NOMBRE DE MARCA</label>
              <input
                type="text"
                value={shortcut.name}
                onChange={e => updateShortcut(shortcut.id, 'name', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none uppercase font-label-caps"
                placeholder="Ej: CASIO"
              />
            </div>
            
            <div>
              <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">URL DE LA IMAGEN</label>
              <input
                type="text"
                value={shortcut.image}
                onChange={e => updateShortcut(shortcut.id, 'image', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block font-label-caps text-[9px] tracking-wider text-white/40 mb-2">ENLACE (URL o PATH)</label>
              <input
                type="text"
                value={shortcut.link}
                onChange={e => updateShortcut(shortcut.id, 'link', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 text-sm text-white focus:border-[#D4AF37]/40 outline-none"
                placeholder="Ej: /buscar?q=casio"
              />
            </div>
          </div>
        ))}
        {(data.brandShortcuts?.length === 0) && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 text-white/30 font-label-caps text-[11px] tracking-widest">
            NO HAY ATAJOS CREADOS
          </div>
        )}
      </div>
    </div>
  )
}

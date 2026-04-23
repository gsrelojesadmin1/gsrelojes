'use client'

import { useState, useEffect } from 'react'
import ImageUploader from '@/components/admin/ImageUploader'
import type { SiteData } from '@/lib/types'

type HeroKey = keyof SiteData['hero']

export default function AdminHeroPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData).catch(() => setError('Error loading data'))
  }, [])

  const update = (key: HeroKey, value: string) => {
    setData(prev => prev ? { ...prev, hero: { ...prev.hero, [key]: value } } : prev)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (!data) {
    return (
      <div className="p-10 flex items-center gap-3">
        <span className="material-symbols-outlined text-white/30 animate-spin" style={{ fontSize: '20px' }}>refresh</span>
        <span className="text-white/30 text-sm">Cargando...</span>
      </div>
    )
  }

  const fields: { key: HeroKey; label: string; multiline?: boolean }[] = [
    { key: 'badge', label: 'BADGE (ej: ESTABLISHED 1892)' },
    { key: 'title', label: 'TÍTULO (usa \\n para saltos de línea)', multiline: true },
    { key: 'subtitle', label: 'SUBTÍTULO', multiline: true },
    { key: 'cta1Label', label: 'BOTÓN PRINCIPAL' },
    { key: 'cta2Label', label: 'BOTÓN SECUNDARIO' },
  ]

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">ADMIN / HERO</p>
        <h1 className="text-white text-2xl font-light">Sección Hero</h1>
      </div>

      <div className="space-y-7">
        <ImageUploader
          label="IMAGEN DE FONDO"
          value={data.hero.backgroundImage}
          onChange={v => update('backgroundImage', v)}
        />

        {fields.map(({ key, label, multiline }) => (
          <div key={key}>
            <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
              {label}
            </label>
            {multiline ? (
              <textarea
                value={data.hero[key]}
                onChange={e => update(key, e.target.value)}
                rows={3}
                className="w-full bg-[#0e0e0e] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors resize-none font-light"
              />
            ) : (
              <input
                type="text"
                value={data.hero[key]}
                onChange={e => update(key, e.target.value)}
                className="w-full bg-[#0e0e0e] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light"
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="mt-6 text-red-400 text-xs">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 px-8 py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.22em] hover:bg-[#f2ca50] transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3"
      >
        {saving ? (
          <>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>refresh</span>
            GUARDANDO...
          </>
        ) : saved ? (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
            GUARDADO
          </>
        ) : 'GUARDAR CAMBIOS'}
      </button>
    </div>
  )
}

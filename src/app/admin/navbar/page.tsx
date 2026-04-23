'use client'

import { useState, useEffect } from 'react'
import type { SiteData, NavLink } from '@/lib/types'

export default function AdminNavbarPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData).catch(() => setError('Error loading data'))
  }, [])

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

  const updateBrand = (value: string) => {
    setData(prev => prev ? { ...prev, navbar: { ...prev.navbar, brandName: value } } : prev)
    setSaved(false)
  }

  const updateLink = (id: string, field: keyof NavLink, value: string) => {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        navbar: {
          ...prev.navbar,
          links: prev.navbar.links.map(l => l.id === id ? { ...l, [field]: value } : l),
        },
      }
    })
    setSaved(false)
  }

  const addLink = () => {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        navbar: {
          ...prev.navbar,
          links: [...prev.navbar.links, { id: Date.now().toString(), label: 'Nuevo Link', href: '#' }],
        },
      }
    })
    setSaved(false)
  }

  const removeLink = (id: string) => {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        navbar: { ...prev.navbar, links: prev.navbar.links.filter(l => l.id !== id) },
      }
    })
    setSaved(false)
  }

  const moveLink = (id: string, dir: -1 | 1) => {
    setData(prev => {
      if (!prev) return prev
      const links = [...prev.navbar.links]
      const idx = links.findIndex(l => l.id === id)
      if (idx + dir < 0 || idx + dir >= links.length) return prev
      ;[links[idx], links[idx + dir]] = [links[idx + dir], links[idx]]
      return { ...prev, navbar: { ...prev.navbar, links } }
    })
    setSaved(false)
  }

  if (!data) return <div className="p-10 text-white/30 text-sm">Cargando...</div>

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">ADMIN / NAVBAR</p>
        <h1 className="text-white text-2xl font-light">Navegación</h1>
      </div>

      {/* Brand name */}
      <div className="mb-8 p-6 bg-[#111] border border-white/8">
        <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-3">
          NOMBRE DE MARCA
        </label>
        <input
          type="text"
          value={data.navbar.brandName}
          onChange={e => updateBrand(e.target.value)}
          className="w-full bg-[#0e0e0e] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light tracking-widest"
        />
      </div>

      {/* Links */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="font-label-caps text-[10px] tracking-[0.15em] text-white/45">ENLACES DE NAVEGACIÓN</p>
          <button
            onClick={addLink}
            className="flex items-center gap-2 font-label-caps text-[9px] tracking-[0.15em] text-[#D4AF37] hover:text-[#f2ca50] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
            AÑADIR LINK
          </button>
        </div>

        <div className="space-y-2">
          {data.navbar.links.map((link, idx) => (
            <div key={link.id} className="flex items-center gap-2 bg-[#111] border border-white/8 p-4">
              {/* Order */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveLink(link.id, -1)}
                  disabled={idx === 0}
                  className="text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors"
                  aria-label="Move up"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>expand_less</span>
                </button>
                <button
                  onClick={() => moveLink(link.id, 1)}
                  disabled={idx === data.navbar.links.length - 1}
                  className="text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors"
                  aria-label="Move down"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>expand_more</span>
                </button>
              </div>

              {/* Label */}
              <input
                type="text"
                value={link.label}
                onChange={e => updateLink(link.id, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1 bg-[#0e0e0e] border border-white/10 text-white text-sm px-3 py-2 focus:border-[#D4AF37]/40 transition-colors font-light"
              />

              {/* Href */}
              <input
                type="text"
                value={link.href}
                onChange={e => updateLink(link.id, 'href', e.target.value)}
                placeholder="/ruta o #seccion"
                className="flex-1 bg-[#0e0e0e] border border-white/10 text-white/60 text-sm px-3 py-2 focus:border-[#D4AF37]/40 transition-colors font-light"
              />

              {/* Delete */}
              <button
                onClick={() => removeLink(link.id)}
                className="text-white/20 hover:text-red-400 transition-colors p-1"
                aria-label="Remove link"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-red-400 text-xs">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.22em] hover:bg-[#f2ca50] transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3"
      >
        {saving ? 'GUARDANDO...' : saved ? '✓ GUARDADO' : 'GUARDAR CAMBIOS'}
      </button>
    </div>
  )
}

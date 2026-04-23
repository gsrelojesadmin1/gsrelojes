'use client'

import { useState, useEffect } from 'react'
import type { SiteData, NavLink } from '@/lib/types'

export default function AdminFooterPage() {
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
      setError('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: 'brandName' | 'copyright', value: string) => {
    setData(prev => prev ? { ...prev, footer: { ...prev.footer, [field]: value } } : prev)
    setSaved(false)
  }

  const updateLink = (id: string, field: keyof NavLink, value: string) => {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        footer: {
          ...prev.footer,
          links: prev.footer.links.map(l => l.id === id ? { ...l, [field]: value } : l),
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
        footer: {
          ...prev.footer,
          links: [...prev.footer.links, { id: Date.now().toString(), label: 'Nuevo Link', href: '#' }],
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
        footer: { ...prev.footer, links: prev.footer.links.filter(l => l.id !== id) },
      }
    })
    setSaved(false)
  }

  if (!data) return <div className="p-10 text-white/30 text-sm">Cargando...</div>

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">ADMIN / FOOTER</p>
        <h1 className="text-white text-2xl font-light">Footer</h1>
      </div>

      <div className="space-y-6">
        {/* Brand name */}
        <div className="p-6 bg-[#111] border border-white/8">
          <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-3">
            NOMBRE DE MARCA
          </label>
          <input
            type="text"
            value={data.footer.brandName}
            onChange={e => updateField('brandName', e.target.value)}
            className="w-full bg-[#0e0e0e] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light tracking-widest"
          />
        </div>

        {/* Copyright */}
        <div className="p-6 bg-[#111] border border-white/8">
          <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-3">
            TEXTO DE COPYRIGHT
          </label>
          <input
            type="text"
            value={data.footer.copyright}
            onChange={e => updateField('copyright', e.target.value)}
            className="w-full bg-[#0e0e0e] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light"
          />
        </div>

        {/* Links */}
        <div className="p-6 bg-[#111] border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <label className="font-label-caps text-[10px] tracking-[0.15em] text-white/45">
              ENLACES DEL FOOTER
            </label>
            <button
              onClick={addLink}
              className="flex items-center gap-2 font-label-caps text-[9px] tracking-[0.15em] text-[#D4AF37] hover:text-[#f2ca50] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
              AÑADIR
            </button>
          </div>

          <div className="space-y-2">
            {data.footer.links.map(link => (
              <div key={link.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={e => updateLink(link.id, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1 bg-[#0e0e0e] border border-white/10 text-white text-sm px-3 py-2.5 focus:border-[#D4AF37]/40 transition-colors font-light"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={e => updateLink(link.id, 'href', e.target.value)}
                  placeholder="/ruta"
                  className="flex-1 bg-[#0e0e0e] border border-white/10 text-white/60 text-sm px-3 py-2.5 focus:border-[#D4AF37]/40 transition-colors font-light"
                />
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
      </div>

      {error && <p className="mt-6 text-red-400 text-xs">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 px-8 py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.22em] hover:bg-[#f2ca50] transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {saving ? 'GUARDANDO...' : saved ? '✓ GUARDADO' : 'GUARDAR CAMBIOS'}
      </button>
    </div>
  )
}

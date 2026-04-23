'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { SiteData, BentoItem } from '@/lib/types'

function genId() {
  return 'bento-' + Math.random().toString(36).slice(2, 9)
}

const emptyItem = (): BentoItem => ({
  id: genId(),
  title: '',
  description: '',
  linkLabel: 'EXPLORAR',
  src: '',
  large: false,
})

export default function AdminBentoPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BentoItem | null>(null)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData).catch(() => setError('Error al cargar datos'))
  }, [])

  const handleSaveAll = async (updatedData: SiteData) => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
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

  const openEdit = (item: BentoItem) => {
    setEditingId(item.id)
    setDraft({ ...item })
  }

  const openNew = () => {
    const item = emptyItem()
    setEditingId(item.id)
    setDraft(item)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(null)
  }

  const saveItem = () => {
    if (!data || !draft) return
    const exists = data.bentoItems.some(i => i.id === draft.id)
    const updated = exists
      ? data.bentoItems.map(i => i.id === draft.id ? draft : i)
      : [...data.bentoItems, draft]
    const newData = { ...data, bentoItems: updated }
    setData(newData)
    handleSaveAll(newData)
    setEditingId(null)
    setDraft(null)
  }

  const deleteItem = (id: string) => {
    if (!data) return
    if (!confirm('¿Eliminar esta tarjeta del bento grid?')) return
    const newData = { ...data, bentoItems: data.bentoItems.filter(i => i.id !== id) }
    setData(newData)
    handleSaveAll(newData)
  }

  if (!data) {
    return (
      <div className="p-10 flex items-center gap-3">
        <span className="material-symbols-outlined text-white/30 animate-spin" style={{ fontSize: '20px' }}>refresh</span>
        <span className="text-white/30 text-sm">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="p-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">
            ADMIN / PUBLICIDAD / BENTO
          </p>
          <h1 className="text-white text-2xl font-light">Bento Grid</h1>
          <p className="text-white/35 text-sm mt-2 font-light">
            Gestiona las tarjetas del grid visual debajo del hero.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] hover:bg-[#f2ca50] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          AÑADIR TARJETA
        </button>
      </div>

      {error && <p className="mb-6 text-red-400 text-xs">{error}</p>}

      {/* Lista de ítems */}
      <div className="space-y-3 mb-8">
        {data.bentoItems.length === 0 && (
          <div className="bg-[#111] border border-white/8 p-10 text-center">
            <span className="material-symbols-outlined text-white/20 mb-3 block" style={{ fontSize: '32px' }}>grid_view</span>
            <p className="text-white/30 text-sm font-light">No hay tarjetas. Haz clic en "AÑADIR TARJETA" para comenzar.</p>
          </div>
        )}

        {data.bentoItems.map((item, idx) => (
          <div
            key={item.id}
            className="bg-[#111] border border-white/8 p-5 flex items-center gap-5 hover:border-white/15 transition-colors"
          >
            {/* Preview imagen */}
            <div className="w-20 h-14 relative flex-none overflow-hidden bg-white/5">
              {item.src ? (
                <Image src={item.src} alt={item.title} fill className="object-cover opacity-70" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/20" style={{ fontSize: '20px' }}>image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-light truncate">{item.title || '(sin título)'}</p>
              <p className="text-white/30 text-xs mt-0.5 truncate">{item.src || '(sin imagen)'}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`font-label-caps text-[9px] tracking-[0.12em] px-1.5 py-0.5 ${item.large ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-white/5 text-white/30'}`}>
                  {item.large ? 'GRANDE' : 'NORMAL'}
                </span>
                <span className="text-white/20 text-[10px]">#{idx + 1}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-none">
              <button
                onClick={() => openEdit(item)}
                className="w-9 h-9 flex items-center justify-center bg-white/5 text-white/40 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] transition-colors"
                title="Editar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="w-9 h-9 flex items-center justify-center bg-white/5 text-white/40 hover:bg-red-500/15 hover:text-red-400 transition-colors"
                title="Eliminar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingId && draft && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-[#0d0d0d] border border-white/12 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-7 border-b border-white/8 flex items-center justify-between">
              <div>
                <p className="font-label-caps text-[10px] tracking-[0.2em] text-[#D4AF37] mb-1">
                  {data.bentoItems.some(i => i.id === draft.id) ? 'EDITAR TARJETA' : 'NUEVA TARJETA'}
                </p>
                <h2 className="text-white text-lg font-light">Bento Grid</h2>
              </div>
              <button
                onClick={cancelEdit}
                className="w-9 h-9 flex items-center justify-center text-white/30 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-7 space-y-6">
              {/* URL de imagen */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  URL DE IMAGEN
                </label>
                <input
                  type="url"
                  value={draft.src}
                  onChange={e => setDraft(d => d ? { ...d, src: e.target.value } : d)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                />
                {/* Preview */}
                {draft.src && (
                  <div className="mt-3 relative h-32 overflow-hidden bg-white/5">
                    <Image src={draft.src} alt="preview" fill className="object-cover opacity-70" unoptimized />
                  </div>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  TÍTULO
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={e => setDraft(d => d ? { ...d, title: e.target.value } : d)}
                  placeholder="Ej: Clásicos Modernos"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  DESCRIPCIÓN <span className="text-white/20">(opcional)</span>
                </label>
                <textarea
                  value={draft.description ?? ''}
                  onChange={e => setDraft(d => d ? { ...d, description: e.target.value || undefined } : d)}
                  placeholder="Breve descripción..."
                  rows={2}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none resize-none placeholder:text-white/20"
                />
              </div>

              {/* Label del link */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  TEXTO DEL ENLACE
                </label>
                <input
                  type="text"
                  value={draft.linkLabel}
                  onChange={e => setDraft(d => d ? { ...d, linkLabel: e.target.value } : d)}
                  placeholder="Ej: EXPLORAR SERIE"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                />
              </div>

              {/* Tamaño */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-3">
                  TAMAÑO DE TARJETA
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: false, label: 'NORMAL', desc: 'Ocupa la mitad del grid', icon: 'crop_square' },
                    { value: true, label: 'GRANDE', desc: 'Ocupa el doble de espacio', icon: 'crop_landscape' },
                  ].map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setDraft(d => d ? { ...d, large: opt.value } : d)}
                      className={`p-4 border text-left transition-all ${draft.large === opt.value
                        ? 'border-[#D4AF37]/50 bg-[#D4AF37]/8'
                        : 'border-white/8 bg-white/3 hover:border-white/20'
                      }`}
                    >
                      <span className={`material-symbols-outlined mb-2 block ${draft.large === opt.value ? 'text-[#D4AF37]' : 'text-white/30'}`} style={{ fontSize: '20px' }}>
                        {opt.icon}
                      </span>
                      <p className={`font-label-caps text-[10px] tracking-[0.12em] mb-1 ${draft.large === opt.value ? 'text-[#D4AF37]' : 'text-white/50'}`}>
                        {opt.label}
                      </p>
                      <p className="text-white/25 text-[11px] font-light">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-7 border-t border-white/8 flex gap-3">
              <button
                onClick={saveItem}
                disabled={saving || !draft.title || !draft.src}
                className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] hover:bg-[#f2ca50] transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>refresh</span>
                    GUARDANDO...
                  </>
                ) : saved ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                    GUARDADO
                  </>
                ) : 'GUARDAR TARJETA'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-3 border border-white/12 text-white/40 font-label-caps text-[10px] tracking-[0.15em] hover:border-white/25 hover:text-white/70 transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="mt-6 bg-[#111] border border-white/8 p-5 flex gap-4">
        <span className="material-symbols-outlined text-[#D4AF37]/50 flex-none" style={{ fontSize: '18px' }}>info</span>
        <div>
          <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/30 mb-1">DISEÑO DEL GRID</p>
          <p className="text-white/25 text-xs font-light leading-relaxed">
            La primera tarjeta marcada como <strong className="text-white/40">GRANDE</strong> ocupa 2 columnas. Las tarjetas <strong className="text-white/40">NORMAL</strong> ocupan 1 columna cada una. Para un grid equilibrado se recomienda 1 grande + 2 normales.
          </p>
        </div>
      </div>
    </div>
  )
}

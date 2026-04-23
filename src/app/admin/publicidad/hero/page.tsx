'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { SiteData, HeroSlide } from '@/lib/types'

function genId() {
  return 'slide-' + Math.random().toString(36).slice(2, 9)
}

const emptySlide = (): HeroSlide => ({
  id: genId(),
  badge: '',
  title: '',
  subtitle: '',
  cta1Label: 'DESCUBRIR LA COLECCIÓN',
  cta2Label: 'NUESTRA HISTORIA',
  backgroundImage: '',
})

export default function AdminPublicidadHeroPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<HeroSlide | null>(null)
  const [previewIdx, setPreviewIdx] = useState(0)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then((d: SiteData) => {
      // Normalizar: si no hay heroSlides usar el hero como slide único
      if (!d.heroSlides || d.heroSlides.length === 0) {
        d.heroSlides = [{ ...d.hero, id: d.hero.id || 'slide-1' }]
      }
      setData(d)
    }).catch(() => setError('Error al cargar datos'))
  }, [])

  const saveAll = async (updated: SiteData) => {
    setSaving(true)
    setError('')
    try {
      // Sincronizar el campo hero legacy con el primer slide
      const synced = {
        ...updated,
        hero: updated.heroSlides[0] ?? updated.hero,
      }
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(synced),
      })
      if (!res.ok) throw new Error()
      setData(synced)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (slide: HeroSlide) => {
    setEditingId(slide.id)
    setDraft({ ...slide })
  }

  const openNew = () => {
    const s = emptySlide()
    setEditingId(s.id)
    setDraft(s)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(null)
  }

  const saveSlide = () => {
    if (!data || !draft) return
    const exists = data.heroSlides.some(s => s.id === draft.id)
    const updated = exists
      ? data.heroSlides.map(s => s.id === draft.id ? draft : s)
      : [...data.heroSlides, draft]
    const newData = { ...data, heroSlides: updated }
    saveAll(newData)
    setEditingId(null)
    setDraft(null)
  }

  const deleteSlide = (id: string) => {
    if (!data) return
    if (data.heroSlides.length <= 1) {
      alert('Debes tener al menos un slide activo.')
      return
    }
    if (!confirm('¿Eliminar este slide del hero?')) return
    const updated = data.heroSlides.filter(s => s.id !== id)
    const newData = { ...data, heroSlides: updated }
    saveAll(newData)
    setPreviewIdx(0)
  }

  const moveSlide = (id: string, dir: 'up' | 'down') => {
    if (!data) return
    const idx = data.heroSlides.findIndex(s => s.id === id)
    if (idx < 0) return
    const arr = [...data.heroSlides]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    const newData = { ...data, heroSlides: arr }
    saveAll(newData)
  }

  if (!data) {
    return (
      <div className="p-10 flex items-center gap-3">
        <span className="material-symbols-outlined text-white/30 animate-spin" style={{ fontSize: '20px' }}>refresh</span>
        <span className="text-white/30 text-sm">Cargando...</span>
      </div>
    )
  }

  const slides = data.heroSlides

  return (
    <div className="p-10 max-w-5xl">
      {/* ── Cabecera ────────────────────────────────────────────── */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">
            ADMIN / PUBLICIDAD / HERO
          </p>
          <h1 className="text-white text-2xl font-light">Slides del Hero</h1>
          <p className="text-white/35 text-sm mt-2 font-light">
            Gestiona los banners del carrusel principal. El orden se respeta en la tienda.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] hover:bg-[#f2ca50] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          AÑADIR SLIDE
        </button>
      </div>

      {error && <p className="mb-6 text-red-400 text-xs">{error}</p>}

      {/* ── Vista previa del carrusel ────────────────────────────── */}
      {slides.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-white/20" style={{ fontSize: '14px' }}>preview</span>
            <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/25">VISTA PREVIA</p>
          </div>
          <div className="relative h-48 overflow-hidden bg-[#0a0a0a] border border-white/8">
            <Image
              src={slides[previewIdx]?.backgroundImage || ''}
              alt={slides[previewIdx]?.title || ''}
              fill
              className="object-cover opacity-50"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="font-label-caps text-[9px] tracking-[0.3em] text-[#D4AF37] mb-1">
                {slides[previewIdx]?.badge}
              </p>
              <h2 className="text-white text-2xl font-light leading-tight">
                {slides[previewIdx]?.title?.replace('\\n', ' ')}
              </h2>
              <p className="text-white/50 text-xs mt-1 font-light line-clamp-1">
                {slides[previewIdx]?.subtitle}
              </p>
            </div>
            {/* Tabs de preview */}
            <div className="absolute top-3 right-3 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setPreviewIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === previewIdx ? 'bg-[#D4AF37] w-4' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lista de slides ──────────────────────────────────────── */}
      <div className="space-y-3 mb-8">
        {slides.length === 0 && (
          <div className="bg-[#111] border border-white/8 p-10 text-center">
            <span className="material-symbols-outlined text-white/20 mb-3 block" style={{ fontSize: '32px' }}>panorama</span>
            <p className="text-white/30 text-sm font-light">Sin slides. Haz clic en "AÑADIR SLIDE".</p>
          </div>
        )}

        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`bg-[#111] border p-5 flex items-center gap-5 transition-colors ${previewIdx === idx ? 'border-[#D4AF37]/20' : 'border-white/8 hover:border-white/15'}`}
            onMouseEnter={() => setPreviewIdx(idx)}
          >
            {/* Número / orden */}
            <div className="w-7 h-7 flex-none flex items-center justify-center bg-white/5 border border-white/8">
              <span className="font-label-caps text-[10px] tracking-[0.1em] text-white/30 tabular-nums">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Preview imagen */}
            <div className="w-20 h-14 relative flex-none overflow-hidden bg-white/5">
              {slide.backgroundImage ? (
                <Image src={slide.backgroundImage} alt={slide.title} fill className="object-cover opacity-60" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/20" style={{ fontSize: '20px' }}>image</span>
                </div>
              )}
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#D4AF37] py-0.5 text-center">
                  <span className="font-label-caps text-[7px] tracking-[0.1em] text-[#0A0A0A]">PRINCIPAL</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-label-caps text-[9px] tracking-[0.2em] text-[#D4AF37] mb-0.5">{slide.badge || '—'}</p>
              <p className="text-white text-sm font-light truncate">{slide.title?.replace('\n', ' ') || '(sin título)'}</p>
              <p className="text-white/30 text-xs mt-0.5 truncate font-light">{slide.subtitle || '(sin subtítulo)'}</p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1 flex-none">
              {/* Mover arriba */}
              <button
                onClick={() => moveSlide(slide.id, 'up')}
                disabled={idx === 0}
                className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white/60 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                title="Mover arriba"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span>
              </button>
              {/* Mover abajo */}
              <button
                onClick={() => moveSlide(slide.id, 'down')}
                disabled={idx === slides.length - 1}
                className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white/60 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                title="Mover abajo"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_downward</span>
              </button>
              {/* Editar */}
              <button
                onClick={() => openEdit(slide)}
                className="w-9 h-9 flex items-center justify-center bg-white/5 text-white/40 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] transition-colors"
                title="Editar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
              </button>
              {/* Eliminar */}
              <button
                onClick={() => deleteSlide(slide.id)}
                disabled={slides.length <= 1}
                className="w-9 h-9 flex items-center justify-center bg-white/5 text-white/40 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                title="Eliminar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Indicación */}
      <div className="bg-[#111] border border-white/8 p-5 flex gap-4">
        <span className="material-symbols-outlined text-[#D4AF37]/50 flex-none" style={{ fontSize: '18px' }}>info</span>
        <div>
          <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/30 mb-1">CARRUSEL AUTOMÁTICO</p>
          <p className="text-white/25 text-xs font-light leading-relaxed">
            Los slides rotan automáticamente cada 6 segundos. El <strong className="text-white/40">primer slide</strong> es el principal y se muestra al cargar la página. Puedes reordenarlos con las flechas.
          </p>
        </div>
      </div>

      {/* ── Modal de edición ─────────────────────────────────────── */}
      {editingId && draft && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-6">
          <div className="bg-[#0d0d0d] border border-white/12 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Header modal */}
            <div className="p-7 border-b border-white/8 flex items-center justify-between sticky top-0 bg-[#0d0d0d] z-10">
              <div>
                <p className="font-label-caps text-[10px] tracking-[0.2em] text-[#D4AF37] mb-1">
                  {slides.some(s => s.id === draft.id) ? 'EDITAR SLIDE' : 'NUEVO SLIDE'}
                </p>
                <h2 className="text-white text-lg font-light">Hero Carrusel</h2>
              </div>
              <button
                onClick={cancelEdit}
                className="w-9 h-9 flex items-center justify-center text-white/30 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-7 space-y-6">
              {/* URL imagen */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  URL DE IMAGEN DE FONDO <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={draft.backgroundImage}
                  onChange={e => setDraft(d => d ? { ...d, backgroundImage: e.target.value } : d)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                />
                {/* Preview de imagen */}
                {draft.backgroundImage && (
                  <div className="mt-3 relative h-32 overflow-hidden bg-white/5 border border-white/8">
                    <Image
                      src={draft.backgroundImage}
                      alt="preview"
                      fill
                      className="object-cover opacity-60"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <p className="font-label-caps text-[8px] tracking-[0.25em] text-[#D4AF37]">{draft.badge}</p>
                      <p className="text-white text-sm font-light">{draft.title?.replace('\n', ' ')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Badge */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  BADGE (texto superior pequeño)
                </label>
                <input
                  type="text"
                  value={draft.badge}
                  onChange={e => setDraft(d => d ? { ...d, badge: e.target.value } : d)}
                  placeholder="Ej: ESTABLECIDO EN 1892"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                />
              </div>

              {/* Título */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  TÍTULO <span className="text-red-400">*</span>
                  <span className="text-white/20 ml-2 normal-case">(usa \n para salto de línea)</span>
                </label>
                <textarea
                  value={draft.title}
                  onChange={e => setDraft(d => d ? { ...d, title: e.target.value } : d)}
                  placeholder={'Ej: PRECISIÓN\nATEMPORAL'}
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none resize-none placeholder:text-white/20"
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                  SUBTÍTULO
                </label>
                <textarea
                  value={draft.subtitle}
                  onChange={e => setDraft(d => d ? { ...d, subtitle: e.target.value } : d)}
                  placeholder="Descripción breve del slide..."
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none resize-none placeholder:text-white/20"
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                    BOTÓN PRINCIPAL
                  </label>
                  <input
                    type="text"
                    value={draft.cta1Label}
                    onChange={e => setDraft(d => d ? { ...d, cta1Label: e.target.value } : d)}
                    placeholder="Ej: VER COLECCIÓN"
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                    BOTÓN SECUNDARIO
                  </label>
                  <input
                    type="text"
                    value={draft.cta2Label}
                    onChange={e => setDraft(d => d ? { ...d, cta2Label: e.target.value } : d)}
                    placeholder="Ej: NUESTRA HISTORIA"
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light outline-none placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className="p-7 border-t border-white/8 flex gap-3 sticky bottom-0 bg-[#0d0d0d]">
              <button
                onClick={saveSlide}
                disabled={saving || !draft.title || !draft.backgroundImage}
                className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.2em] hover:bg-[#f2ca50] transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
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
                ) : 'GUARDAR SLIDE'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-3.5 border border-white/12 text-white/40 font-label-caps text-[10px] tracking-[0.15em] hover:border-white/25 hover:text-white/70 transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

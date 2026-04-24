'use client'

import { useEffect, useState, useId } from 'react'
import type { SiteData, WatchBrand, WatchCollection, WatchModel } from '@/lib/types'

function toSlug(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function uid() {
  return `__new__${Date.now().toString(36)}`
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function AdminCategoriesPage() {
  const [brands, setBrands] = useState<WatchBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [fullData, setFullData] = useState<SiteData | null>(null)

  // expanded state
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set())
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())

  // inline edit state
  const [editingBrand, setEditingBrand] = useState<string | null>(null)
  const [editingCollection, setEditingCollection] = useState<string | null>(null)
  const [editingModel, setEditingModel] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then((data: SiteData) => {
        setFullData(data)
        setBrands(data.watchBrands ?? [])
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    if (!fullData) return
    setSaveState('saving')
    try {
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fullData, watchBrands: brands }),
      })
      if (!res.ok) throw new Error()
      setFullData(d => d ? { ...d, watchBrands: brands } : d)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  // ── Brand operations ─────────────────────────────────────────────────────────

  function addBrand() {
    const id = uid()
    setBrands(b => [...b, { id, name: 'Nueva Marca', collections: [] }])
    setExpandedBrands(s => new Set(s).add(id))
    setEditingBrand(id)
    setEditValue('Nueva Marca')
  }

  function commitBrandName(id: string) {
    const name = editValue.trim()
    if (!name) { setEditingBrand(null); return }
    if (id.startsWith('__new__')) {
      let slug = toSlug(name)
      if (brands.some(b => b.id === slug)) slug = `${slug}-${Date.now().toString(36)}`
      setBrands(b => b.map(br => br.id === id ? { ...br, id: slug, name } : br))
      setExpandedBrands(s => { const n = new Set(s); n.delete(id); n.add(slug); return n })
    } else {
      setBrands(b => b.map(br => br.id === id ? { ...br, name } : br))
    }
    setEditingBrand(null)
  }

  function deleteBrand(id: string) {
    setBrands(b => b.filter(br => br.id !== id))
    setExpandedBrands(s => { const n = new Set(s); n.delete(id); return n })
  }

  // ── Collection operations ────────────────────────────────────────────────────

  function addCollection(brandId: string) {
    const id = uid()
    setBrands(b => b.map(br =>
      br.id === brandId
        ? { ...br, collections: [...br.collections, { id, name: 'Nueva Colección', models: [] }] }
        : br
    ))
    setExpandedCollections(s => new Set(s).add(id))
    setEditingCollection(id)
    setEditValue('Nueva Colección')
  }

  function commitCollectionName(brandId: string, colId: string) {
    const name = editValue.trim()
    if (!name) { setEditingCollection(null); return }
    if (colId.startsWith('__new__')) {
      let slug = `${brandId}-${toSlug(name)}`
      const allColIds = brands.flatMap(b => b.collections.map(c => c.id))
      if (allColIds.includes(slug)) slug = `${slug}-${Date.now().toString(36)}`
      setBrands(b => b.map(br =>
        br.id === brandId
          ? { ...br, collections: br.collections.map(c => c.id === colId ? { ...c, id: slug, name } : c) }
          : br
      ))
      setExpandedCollections(s => { const n = new Set(s); n.delete(colId); n.add(slug); return n })
    } else {
      setBrands(b => b.map(br =>
        br.id === brandId
          ? { ...br, collections: br.collections.map(c => c.id === colId ? { ...c, name } : c) }
          : br
      ))
    }
    setEditingCollection(null)
  }

  function deleteCollection(brandId: string, colId: string) {
    setBrands(b => b.map(br =>
      br.id === brandId
        ? { ...br, collections: br.collections.filter(c => c.id !== colId) }
        : br
    ))
    setExpandedCollections(s => { const n = new Set(s); n.delete(colId); return n })
  }

  // ── Model operations ─────────────────────────────────────────────────────────

  function addModel(brandId: string, colId: string) {
    const id = uid()
    setBrands(b => b.map(br =>
      br.id === brandId
        ? {
            ...br,
            collections: br.collections.map(c =>
              c.id === colId
                ? { ...c, models: [...c.models, { id, name: 'Nuevo Modelo' }] }
                : c
            ),
          }
        : br
    ))
    setEditingModel(id)
    setEditValue('Nuevo Modelo')
  }

  function commitModelName(brandId: string, colId: string, modelId: string) {
    if (editValue.trim()) {
      setBrands(b => b.map(br =>
        br.id === brandId
          ? {
              ...br,
              collections: br.collections.map(c =>
                c.id === colId
                  ? { ...c, models: c.models.map(m => m.id === modelId ? { ...m, name: editValue.trim() } : m) }
                  : c
              ),
            }
          : br
      ))
    }
    setEditingModel(null)
  }

  function deleteModel(brandId: string, colId: string, modelId: string) {
    setBrands(b => b.map(br =>
      br.id === brandId
        ? {
            ...br,
            collections: br.collections.map(c =>
              c.id === colId
                ? { ...c, models: c.models.filter(m => m.id !== modelId) }
                : c
            ),
          }
        : br
    ))
  }

  // ── Toggle helpers ───────────────────────────────────────────────────────────

  function toggleBrand(id: string) {
    setExpandedBrands(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleCollection(id: string) {
    setExpandedCollections(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-white/20 animate-spin" style={{ fontSize: 32 }}>progress_activity</span>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-10 md:py-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-label-caps text-[10px] tracking-[0.3em] text-[#D4AF37] mb-2">GESTIÓN DE CATÁLOGO</p>
          <h1 className="text-white text-2xl font-light tracking-wide">Categorías</h1>
          <p className="text-white/35 text-[12px] mt-1 font-light">
            {brands.length} {brands.length === 1 ? 'marca' : 'marcas'} ·{' '}
            {brands.reduce((a, b) => a + b.collections.length, 0)} colecciones ·{' '}
            {brands.reduce((a, b) => a + b.collections.reduce((c, col) => c + col.models.length, 0), 0)} modelos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={addBrand}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
            <span className="font-label-caps text-[9px] tracking-[0.15em]">NUEVA MARCA</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className={`flex items-center gap-2 px-5 py-2.5 font-label-caps text-[9px] tracking-[0.15em] transition-all ${
              saveState === 'saved'
                ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                : saveState === 'error'
                ? 'bg-red-600/20 border border-red-500/30 text-red-400'
                : 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#c9a430]'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {saveState === 'saving' ? 'progress_activity' : saveState === 'saved' ? 'check' : saveState === 'error' ? 'error' : 'save'}
            </span>
            {saveState === 'saving' ? 'GUARDANDO...' : saveState === 'saved' ? 'GUARDADO' : saveState === 'error' ? 'ERROR' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {brands.length === 0 && (
          <div className="border border-dashed border-white/10 py-16 text-center">
            <span className="material-symbols-outlined text-white/15 block mb-3" style={{ fontSize: 40 }}>account_tree</span>
            <p className="text-white/25 text-sm font-light">No hay marcas. Crea la primera.</p>
          </div>
        )}

        {brands.map(brand => (
          <div key={brand.id} className="border border-white/8 bg-[#0a0a0a]">
            {/* Brand row */}
            <div className="flex items-center group h-12 px-4 gap-2">
              <button
                onClick={() => toggleBrand(brand.id)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <span
                  className={`material-symbols-outlined text-white/30 transition-transform duration-200 ${expandedBrands.has(brand.id) ? 'rotate-90' : ''}`}
                  style={{ fontSize: 16 }}
                >
                  chevron_right
                </span>
                <span className="material-symbols-outlined text-[#D4AF37]/60" style={{ fontSize: 15 }}>watch</span>

                {editingBrand === brand.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => commitBrandName(brand.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitBrandName(brand.id)
                      if (e.key === 'Escape') setEditingBrand(null)
                    }}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 bg-white/5 border border-[#D4AF37]/40 text-white text-sm font-light px-2 py-0.5 outline-none focus:border-[#D4AF37]"
                  />
                ) : (
                  <span className="text-white text-sm font-light flex-1 truncate">{brand.name}</span>
                )}
              </button>

              <span className="text-white/20 text-[11px] font-light mr-2">
                {brand.collections.length} col.
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingBrand(brand.id); setEditValue(brand.name) }}
                  className="p-1.5 text-white/30 hover:text-white/70 transition-colors"
                  title="Editar nombre"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                </button>
                <button
                  onClick={() => addCollection(brand.id)}
                  className="p-1.5 text-white/30 hover:text-[#D4AF37] transition-colors"
                  title="Añadir colección"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                </button>
                <button
                  onClick={() => deleteBrand(brand.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                  title="Eliminar marca"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                </button>
              </div>
            </div>

            {/* Collections */}
            {expandedBrands.has(brand.id) && (
              <div className="border-t border-white/5">
                {brand.collections.length === 0 && (
                  <div className="pl-12 py-4 text-white/20 text-[11px] font-light flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>subdirectory_arrow_right</span>
                    Sin colecciones —{' '}
                    <button onClick={() => addCollection(brand.id)} className="text-[#D4AF37]/60 hover:text-[#D4AF37] underline">
                      añadir
                    </button>
                  </div>
                )}

                {brand.collections.map(col => (
                  <div key={col.id} className="border-b border-white/4 last:border-b-0">
                    {/* Collection row */}
                    <div className="flex items-center group h-10 pl-8 pr-4 gap-2 bg-white/[0.015]">
                      <button
                        onClick={() => toggleCollection(col.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <span
                          className={`material-symbols-outlined text-white/20 transition-transform duration-200 ${expandedCollections.has(col.id) ? 'rotate-90' : ''}`}
                          style={{ fontSize: 14 }}
                        >
                          chevron_right
                        </span>
                        <span className="material-symbols-outlined text-white/25" style={{ fontSize: 13 }}>folder</span>

                        {editingCollection === col.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => commitCollectionName(brand.id, col.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitCollectionName(brand.id, col.id)
                              if (e.key === 'Escape') setEditingCollection(null)
                            }}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 bg-white/5 border border-[#D4AF37]/40 text-white/85 text-[12px] font-light px-2 py-0.5 outline-none focus:border-[#D4AF37]"
                          />
                        ) : (
                          <span className="text-white/70 text-[12px] font-light flex-1 truncate">{col.name}</span>
                        )}
                      </button>

                      <span className="text-white/15 text-[10px] font-light mr-2">
                        {col.models.length} mod.
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingCollection(col.id); setEditValue(col.name) }}
                          className="p-1 text-white/25 hover:text-white/60 transition-colors"
                          title="Editar nombre"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                        </button>
                        <button
                          onClick={() => addModel(brand.id, col.id)}
                          className="p-1 text-white/25 hover:text-[#D4AF37] transition-colors"
                          title="Añadir modelo"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                        </button>
                        <button
                          onClick={() => deleteCollection(brand.id, col.id)}
                          className="p-1 text-white/25 hover:text-red-400 transition-colors"
                          title="Eliminar colección"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Models */}
                    {expandedCollections.has(col.id) && (
                      <div>
                        {col.models.length === 0 && (
                          <div className="pl-20 py-3 text-white/15 text-[10px] font-light flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>subdirectory_arrow_right</span>
                            Sin modelos —{' '}
                            <button onClick={() => addModel(brand.id, col.id)} className="text-[#D4AF37]/50 hover:text-[#D4AF37] underline">
                              añadir
                            </button>
                          </div>
                        )}

                        {col.models.map(model => (
                          <div
                            key={model.id}
                            className="flex items-center group h-9 pl-16 pr-4 gap-2 border-t border-white/3 bg-white/[0.008]"
                          >
                            <span className="material-symbols-outlined text-white/15" style={{ fontSize: 12 }}>radio_button_unchecked</span>

                            {editingModel === model.id ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => commitModelName(brand.id, col.id, model.id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') commitModelName(brand.id, col.id, model.id)
                                  if (e.key === 'Escape') setEditingModel(null)
                                }}
                                className="flex-1 bg-white/5 border border-[#D4AF37]/40 text-white/70 text-[11px] font-light px-2 py-0.5 outline-none focus:border-[#D4AF37]"
                              />
                            ) : (
                              <span className="text-white/50 text-[11px] font-light flex-1 truncate">{model.name}</span>
                            )}

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingModel(model.id); setEditValue(model.name) }}
                                className="p-1 text-white/20 hover:text-white/50 transition-colors"
                                title="Editar nombre"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>edit</span>
                              </button>
                              <button
                                onClick={() => deleteModel(brand.id, col.id, model.id)}
                                className="p-1 text-white/20 hover:text-red-400 transition-colors"
                                title="Eliminar modelo"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>delete</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add model inline */}
                        <button
                          onClick={() => addModel(brand.id, col.id)}
                          className="w-full h-8 pl-16 text-left text-white/15 hover:text-white/40 text-[10px] font-light flex items-center gap-2 transition-colors border-t border-white/3"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>
                          <span className="font-label-caps tracking-[0.1em]">AÑADIR MODELO</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add collection inline */}
                <button
                  onClick={() => addCollection(brand.id)}
                  className="w-full h-9 pl-10 text-left text-white/15 hover:text-white/40 text-[10px] font-light flex items-center gap-2 transition-colors border-t border-white/5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                  <span className="font-label-caps tracking-[0.1em]">AÑADIR COLECCIÓN</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {brands.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className={`flex items-center gap-2 px-6 py-3 font-label-caps text-[10px] tracking-[0.2em] transition-all ${
              saveState === 'saved'
                ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                : saveState === 'error'
                ? 'bg-red-600/20 border border-red-500/30 text-red-400'
                : 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#c9a430]'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
              {saveState === 'saving' ? 'progress_activity' : saveState === 'saved' ? 'check_circle' : saveState === 'error' ? 'error' : 'save'}
            </span>
            {saveState === 'saving' ? 'GUARDANDO...' : saveState === 'saved' ? 'CAMBIOS GUARDADOS' : saveState === 'error' ? 'ERROR AL GUARDAR' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      )}
    </div>
  )
}

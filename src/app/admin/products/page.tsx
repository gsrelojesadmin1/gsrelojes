'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ImageUploader from '@/components/admin/ImageUploader'
import { generateSku, generateSlug } from '@/lib/utils'
import type { SiteData, Product, WatchBrand } from '@/lib/types'

const emptyForm = (): Omit<Product, 'id'> => ({
  sku: '',
  slug: '',
  brand: '',
  name: '',
  price: 0,
  salePrice: undefined,
  image: '',
  images: [],
  category: { brandId: '', collectionId: '', modelId: '' },
  description: '',
})

export default function AdminProductsPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData).catch(() => setError('Error cargando datos'))
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const watchBrands: WatchBrand[] = data?.watchBrands ?? []
  const selectedWatchBrand = watchBrands.find(b => b.id === form.category.brandId)
  const collections = selectedWatchBrand?.collections ?? []
  const selectedCollection = collections.find(c => c.id === form.category.collectionId)
  const models = selectedCollection?.models ?? []

  const updateForm = <K extends keyof Omit<Product, 'id'>>(key: K, value: Omit<Product, 'id'>[K]) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const autoFillSkuSlug = (brand: string, name: string) => {
    if (brand && name) {
      setForm(f => ({
        ...f,
        sku: f.sku || generateSku(brand, name),
        slug: f.slug || generateSlug(brand, name),
      }))
    }
  }

  const handleNameChange = (name: string) => {
    setForm(f => {
      const newForm = { ...f, name }
      if (!f.sku && f.brand && name) newForm.sku = generateSku(f.brand, name)
      if (!f.slug && f.brand && name) newForm.slug = generateSlug(f.brand, name)
      return newForm
    })
  }

  const handleBrandDisplayChange = (brand: string) => {
    setForm(f => {
      const newForm = { ...f, brand }
      if (!f.sku && brand && f.name) newForm.sku = generateSku(brand, f.name)
      if (!f.slug && brand && f.name) newForm.slug = generateSlug(brand, f.name)
      return newForm
    })
  }

  const handleHierarchyBrandChange = (brandId: string) => {
    const wb = watchBrands.find(b => b.id === brandId)
    setForm(f => ({
      ...f,
      brand: wb ? wb.name.toUpperCase() : f.brand,
      category: { brandId, collectionId: '', modelId: '' },
    }))
  }

  const handleCollectionChange = (collectionId: string) => {
    setForm(f => ({ ...f, category: { ...f.category, collectionId, modelId: '' } }))
  }

  const handleModelChange = (modelId: string) => {
    setForm(f => ({ ...f, category: { ...f.category, modelId } }))
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const saveData = async (updated: SiteData) => {
    setSaving(true)
    setError('')
    try {
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

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id)
    const { id: _id, ...rest } = product
    setForm(rest)
    setModalOpen(true)
  }

  const handleModalSave = async () => {
    if (!data || !form.brand || !form.name || !form.price) return
    let updated: SiteData

    if (editingId) {
      updated = { ...data, products: data.products.map(p => p.id === editingId ? { ...form, id: editingId } : p) }
    } else {
      updated = { ...data, products: [...data.products, { ...form, id: `p${Date.now()}` }] }
    }

    await saveData(updated)
    setModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!data) return
    await saveData({ ...data, products: data.products.filter(p => p.id !== id) })
    setDeletingId(null)
  }

  // ── Filtered ──────────────────────────────────────────────────────────────

  const filtered = data?.products.filter(p =>
    !search ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  // ── Category label helper ─────────────────────────────────────────────────

  const getCategoryLabel = (product: Product) => {
    if (!data) return '—'
    const wb = data.watchBrands.find(b => b.id === product.category.brandId)
    const col = wb?.collections.find(c => c.id === product.category.collectionId)
    const mod = col?.models.find(m => m.id === product.category.modelId)
    if (!wb) return '—'
    return [wb.name, col?.name, mod?.name].filter(Boolean).join(' › ')
  }

  if (!data) return <div className="p-10 text-white/30 text-sm">Cargando...</div>

  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">ADMIN / PRODUCTOS</p>
          <h1 className="text-white text-2xl font-light">Catálogo</h1>
          <p className="text-white/30 text-sm mt-1 font-light">{data.products.length} piezas</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.18em] hover:bg-[#f2ca50] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          AÑADIR PRODUCTO
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-[#111] border border-white/8 px-4 py-3 mb-6 max-w-sm">
        <span className="material-symbols-outlined text-white/25" style={{ fontSize: '16px' }}>search</span>
        <input
          type="search"
          placeholder="Buscar marca, nombre o SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-white/70 text-sm placeholder:text-white/25 font-light"
        />
      </div>

      {error && <p className="mb-4 text-red-400 text-xs">{error}</p>}
      {saved && <p className="mb-4 text-green-400/80 font-label-caps text-[10px] tracking-wider">✓ GUARDADO</p>}

      {/* Table */}
      <div className="bg-[#111] border border-white/8 overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-white/8">
              {['IMG', 'SKU', 'MARCA / NOMBRE', 'CATEGORÍA', 'PRECIO', 'OFERTA', ''].map(h => (
                <th key={h} className="px-4 py-4 text-left font-label-caps text-[9px] tracking-[0.15em] text-white/30 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-white/2 transition-colors group">
                <td className="px-4 py-4 w-12">
                  <div className="relative w-10 h-12 bg-[#0e0e0e] overflow-hidden">
                    {product.image && (
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" unoptimized={product.image.startsWith('/uploads/')} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-[11px] text-white/40">{product.sku}</span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-label-caps text-[9px] tracking-[0.12em] text-[#D4AF37] mb-0.5">{product.brand}</p>
                  <p className="text-white/80 text-sm font-light">{product.name}</p>
                  <p className="text-white/20 text-[10px] mt-0.5 font-mono">{product.slug}</p>
                </td>
                <td className="px-4 py-4 max-w-[180px]">
                  <span className="text-white/30 text-xs font-light leading-snug">{getCategoryLabel(product)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-white/60 text-sm tabular-nums font-light">${product.price.toLocaleString()}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {product.salePrice ? (
                    <span className="text-[#D4AF37] text-sm tabular-nums font-light">${product.salePrice.toLocaleString()}</span>
                  ) : (
                    <span className="text-white/15 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(product)} className="text-white/25 hover:text-white p-1 transition-colors" aria-label="Editar">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                    </button>
                    {deletingId === product.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(product.id)} className="font-label-caps text-[9px] text-red-400 hover:text-red-300 px-1 tracking-wider">SÍ</button>
                        <button onClick={() => setDeletingId(null)} className="font-label-caps text-[9px] text-white/25 hover:text-white/50 px-1">NO</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(product.id)} className="text-white/20 hover:text-red-400 p-1 transition-colors" aria-label="Eliminar">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/25 text-sm font-light">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-2xl max-h-[92vh] overflow-y-auto admin-scroll flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/8 sticky top-0 bg-[#0e0e0e] z-10">
              <p className="font-label-caps text-[11px] tracking-[0.2em] text-white">
                {editingId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </p>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white transition-colors" aria-label="Cerrar">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-8 space-y-8 flex-1">
              {/* ── Imagen principal ── */}
              <ImageUploader label="IMAGEN PRINCIPAL (portada)" value={form.image} onChange={v => updateForm('image', v)} />

              {/* ── Galería adicional ── */}
              <section>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/8">
                  <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30">
                    GALERÍA DE IMÁGENES <span className="text-white/20 normal-case ml-1">({(form.images ?? []).length} adicionales)</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => updateForm('images', [...(form.images ?? []), ''])}
                    className="flex items-center gap-1.5 text-white/35 hover:text-[#D4AF37] font-label-caps text-[9px] tracking-[0.12em] transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add_photo_alternate</span>
                    AÑADIR IMAGEN
                  </button>
                </div>

                {(form.images ?? []).length === 0 ? (
                  <div className="border border-dashed border-white/8 py-6 text-center">
                    <span className="material-symbols-outlined text-white/15 block mb-2" style={{ fontSize: 28 }}>photo_library</span>
                    <p className="text-white/20 text-[11px] font-light">Sin imágenes adicionales</p>
                    <button
                      type="button"
                      onClick={() => updateForm('images', [''])}
                      className="mt-2 text-[#D4AF37]/50 hover:text-[#D4AF37] font-label-caps text-[9px] tracking-[0.12em] transition-colors"
                    >
                      + AÑADIR
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(form.images ?? []).map((imgUrl, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-[#111] border border-white/6 p-3">
                        {/* Thumbnail preview */}
                        <div className="relative flex-none w-14 h-16 bg-[#0e0e0e] border border-white/6 overflow-hidden">
                          {imgUrl && (
                            <Image
                              src={imgUrl}
                              alt={`Galería ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="56px"
                              unoptimized={imgUrl.startsWith('/uploads/')}
                            />
                          )}
                          {!imgUrl && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-white/15" style={{ fontSize: 18 }}>image</span>
                            </div>
                          )}
                          <div className="absolute top-0 left-0 bg-[#0A0A0A]/60 px-1 py-0.5">
                            <span className="font-label-caps text-[8px] text-white/40">{idx + 2}</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <ImageUploader
                            label={`IMAGEN ${idx + 2}`}
                            value={imgUrl}
                            onChange={v => {
                              const next = [...(form.images ?? [])]
                              next[idx] = v
                              updateForm('images', next)
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const next = (form.images ?? []).filter((_, i) => i !== idx)
                            updateForm('images', next)
                          }}
                          className="flex-none p-1.5 text-white/25 hover:text-red-400 transition-colors mt-6"
                          aria-label="Eliminar imagen"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Identidad ── */}
              <section>
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30 mb-4 pb-2 border-b border-white/8">IDENTIDAD</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">NOMBRE DEL PRODUCTO *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="Patrimony Moon Phase"
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">SKU</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.sku}
                        onChange={e => updateForm('sku', e.target.value)}
                        placeholder="VC-PMO-001"
                        className="flex-1 bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-mono placeholder:text-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm('sku', generateSku(form.brand, form.name))}
                        title="Regenerar SKU"
                        className="px-3 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">SLUG</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.slug}
                        onChange={e => updateForm('slug', e.target.value)}
                        placeholder="vacheron-patrimony-moon-phase"
                        className="flex-1 bg-[#111] border border-white/10 text-white/60 text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-mono placeholder:text-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm('slug', generateSlug(form.brand, form.name))}
                        title="Regenerar slug"
                        className="px-3 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Categoría en cascada ── */}
              <section>
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30 mb-4 pb-2 border-b border-white/8">CATEGORÍA</p>
                <div className="grid grid-cols-3 gap-4">
                  {/* Marca de la jerarquía */}
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">MARCA</label>
                    <select
                      value={form.category.brandId}
                      onChange={e => handleHierarchyBrandChange(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors"
                    >
                      <option value="" className="bg-[#111]">Seleccionar…</option>
                      {watchBrands.map(b => (
                        <option key={b.id} value={b.id} className="bg-[#111]">{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Colección */}
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">COLECCIÓN</label>
                    <select
                      value={form.category.collectionId}
                      onChange={e => handleCollectionChange(e.target.value)}
                      disabled={!form.category.brandId}
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors disabled:opacity-30"
                    >
                      <option value="" className="bg-[#111]">Seleccionar…</option>
                      {collections.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Modelo */}
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">MODELO</label>
                    <select
                      value={form.category.modelId}
                      onChange={e => handleModelChange(e.target.value)}
                      disabled={!form.category.collectionId}
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors disabled:opacity-30"
                    >
                      <option value="" className="bg-[#111]">Seleccionar…</option>
                      {models.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#111]">{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nombre de marca display (editable) */}
                <div className="mt-4">
                  <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">NOMBRE DE MARCA EN TARJETA *</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => handleBrandDisplayChange(e.target.value)}
                    placeholder="VACHERON CONSTANTIN"
                    className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light tracking-wider placeholder:text-white/20"
                  />
                  <p className="text-white/20 text-xs mt-1">Se rellena automáticamente al elegir la marca de categoría, pero puedes editarlo.</p>
                </div>
              </section>

              {/* ── Precios ── */}
              <section>
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30 mb-4 pb-2 border-b border-white/8">PRECIOS (USD)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">PRECIO NORMAL *</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={e => updateForm('price', Number(e.target.value))}
                      placeholder="32500"
                      min="0"
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors tabular-nums placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">
                      PRECIO OFERTA <span className="text-white/25 normal-case">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      value={form.salePrice ?? ''}
                      onChange={e => updateForm('salePrice', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="28000"
                      min="0"
                      className="w-full bg-[#111] border border-white/10 text-[#D4AF37] text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors tabular-nums placeholder:text-white/20"
                    />
                    {form.salePrice && form.price && form.salePrice < form.price && (
                      <p className="text-[#D4AF37]/60 text-xs mt-1">
                        Descuento: {Math.round((1 - form.salePrice / form.price) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Descripción ── */}
              <section>
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30 mb-4 pb-2 border-b border-white/8">DESCRIPCIÓN</p>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Descripción del producto..."
                  rows={3}
                  className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#D4AF37]/40 transition-colors font-light placeholder:text-white/20 resize-none"
                />
              </section>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-white/8 sticky bottom-0 bg-[#0e0e0e]">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 border border-white/10 text-white/40 font-label-caps text-[10px] tracking-[0.15em] hover:border-white/25 hover:text-white/70 transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={handleModalSave}
                disabled={saving || !form.brand || !form.name || !form.price}
                className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.18em] hover:bg-[#f2ca50] transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
              >
                {saving ? 'GUARDANDO...' : editingId ? 'ACTUALIZAR' : 'CREAR PRODUCTO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

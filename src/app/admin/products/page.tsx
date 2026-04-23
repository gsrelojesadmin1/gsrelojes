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
  tags: [],
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

  const updateForm = <K extends keyof Omit<Product, 'id'>>(key: K, value: Omit<Product, 'id'>[K]) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const generateAutoSlug = (name: string, sku: string) => {
    const base = `${name} ${sku}`
    return base
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({
      ...f,
      name,
      slug: generateAutoSlug(name, f.sku)
    }))
  }

  const handleSkuChange = (sku: string) => {
    setForm(f => ({
      ...f,
      sku,
      slug: generateAutoSlug(f.name, sku)
    }))
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

  // ── Quick Add Helpers ───────────────────────────────────────────────────

  const addQuickBrand = async () => {
    const name = prompt('Nombre de la nueva marca:')
    if (!name || !data) return
    const id = name.toLowerCase().replace(/\s+/g, '-')
    if (data.watchBrands.some(b => b.id === id)) return alert('Ya existe esta marca')

    const newBrand: WatchBrand = { id, name, collections: [] }
    const updated = { ...data, watchBrands: [...data.watchBrands, newBrand] }
    setData(updated) // Local update first
    handleHierarchyBrandChange(id)
  }

  const addQuickCollection = async () => {
    if (!form.category.brandId || !data) return
    const name = prompt('Nombre de la nueva colección (ej: Vintage, Edifice, G-Shock):')
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, '-')
    
    const updated = {
      ...data,
      watchBrands: data.watchBrands.map(b => 
        b.id === form.category.brandId 
          ? { ...b, collections: [...b.collections, { id, name, models: [] }] }
          : b
      )
    }
    setData(updated) // Local update first
    handleCollectionChange(id)
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
    if (!data || !form.name || !form.sku || !form.price || !form.category.brandId || !form.category.collectionId) {
      alert('Por favor rellena todos los campos obligatorios (*) y selecciona Marca/Colección')
      return
    }
    
    const finalForm = { ...form, slug: generateAutoSlug(form.name, form.sku) }

    let updated: SiteData
    if (editingId) {
      updated = { ...data, products: data.products.map(p => p.id === editingId ? { ...finalForm, id: editingId } : p) }
    } else {
      updated = { ...data, products: [...data.products, { ...finalForm, id: `p${Date.now()}` }] }
    }

    await saveData(updated)
    setModalOpen(false)
  }

  // ── Image Handlers ───────────────────────────────────────────────────────

  const handleFileUpload = async (file: File, isMain: boolean, index?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (isMain) updateForm('image', data.url)
        else if (index !== undefined) {
          const next = [...(form.images ?? [])]
          next[index] = data.url
          updateForm('images', next)
        } else {
          updateForm('images', [...(form.images ?? []), data.url])
        }
      }
    } catch (err) {
      alert('Error subiendo imagen')
    }
  }

  const handleImagePaste = (e: React.ClipboardEvent, isMain: boolean, index?: number) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = items[i].getAsFile()
        if (blob) handleFileUpload(blob, isMain, index)
        break
      }
    }
  }

  // ── Image Reordering ───────────────────────────────────────────────────

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const images = [...(form.images ?? [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    
    const temp = images[index]
    images[index] = images[newIndex]
    images[newIndex] = temp
    updateForm('images', images)
  }

  const promoteToMain = (index: number) => {
    const images = [...(form.images ?? [])]
    const currentMain = form.image
    const newMain = images[index]
    
    images[index] = currentMain
    setForm(f => ({ ...f, image: newMain, images }))
  }

  // ── Tags ─────────────────────────────────────────────────────────────────

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = e.currentTarget.value.trim()
      if (val && !(form.tags ?? []).includes(val)) {
        updateForm('tags', [...(form.tags ?? []), val])
      }
      e.currentTarget.value = ''
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateForm('tags', (form.tags ?? []).filter(t => t !== tagToRemove))
  }

  const handleDelete = async (id: string) => {
    if (!data) return
    await saveData({ ...data, products: data.products.filter(p => p.id !== id) })
    setDeletingId(null)
  }

  const filtered = data?.products.filter(p =>
    !search ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const getCategoryLabel = (product: Product) => {
    if (!data) return '—'
    const wb = data.watchBrands.find(b => b.id === product.category.brandId)
    const col = wb?.collections.find(c => c.id === product.category.collectionId)
    if (!wb) return '—'
    return [wb.name, col?.name].filter(Boolean).join(' › ')
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

      <div className="bg-[#111] border border-white/8 overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-white/8">
              {['IMG', 'SKU (DISEÑO)', 'MARCA / NOMBRE', 'CATEGORÍA', 'PRECIO', 'OFERTA', ''].map(h => (
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
                  <span className="font-mono text-[11px] text-[#D4AF37]">{product.sku}</span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-label-caps text-[9px] tracking-[0.12em] text-[#D4AF37] mb-0.5">{product.brand}</p>
                  <p className="text-white/80 text-sm font-light">{product.name}</p>
                </td>
                <td className="px-4 py-4 max-w-[180px]">
                  <span className="text-white/30 text-xs font-light leading-snug">{getCategoryLabel(product)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-white/60 text-sm tabular-nums font-light">₲{product.price.toLocaleString('es-PY')}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {product.salePrice ? (
                    <span className="text-[#D4AF37] text-sm tabular-nums font-light">₲{product.salePrice.toLocaleString('es-PY')}</span>
                  ) : (
                    <span className="text-white/15 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(product)} className="text-white/25 hover:text-white p-1 transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                    </button>
                    {deletingId === product.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(product.id)} className="font-label-caps text-[9px] text-red-400 px-1">SÍ</button>
                        <button onClick={() => setDeletingId(null)} className="font-label-caps text-[9px] text-white/25 px-1">NO</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(product.id)} className="text-white/20 hover:text-red-400 p-1 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/8 sticky top-0 bg-[#0e0e0e] z-10">
              <p className="font-label-caps text-[11px] tracking-[0.2em] text-white">
                {editingId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </p>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* ── Galería de Imágenes (Compacta) ── */}
              <section>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/8">
                  <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30">IMÁGENES DEL RELOJ</p>
                  <p className="text-[#D4AF37]/50 text-[9px] font-light italic">Pega URL, usa Ctrl+V o sube archivo</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* IMAGEN PRINCIPAL */}
                  <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                    <p className="font-label-caps text-[9px] tracking-wider text-[#D4AF37]">PRINCIPAL (PORTADA)</p>
                    <div 
                      className="relative aspect-[3/4] bg-[#0e0e0e] border border-dashed border-[#D4AF37]/40 flex flex-col items-center justify-center group overflow-hidden"
                      onPaste={(e) => handleImagePaste(e, true)}
                    >
                      {form.image ? (
                        <>
                          <Image src={form.image} alt="Main" fill className="object-cover" unoptimized={form.image.startsWith('/uploads/')} />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer text-white hover:text-[#D4AF37]">
                              <span className="material-symbols-outlined" style={{fontSize:24}}>upload</span>
                              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center text-[#D4AF37]/40 hover:text-[#D4AF37] transition-colors w-full h-full justify-center">
                          <span className="material-symbols-outlined mb-1">add_photo_alternate</span>
                          <span className="text-[9px] font-label-caps">SUBIR O PEGAR</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)} />
                        </label>
                      )}
                    </div>
                    <input 
                      type="url" placeholder="URL directa..." value={form.image} onChange={e => updateForm('image', e.target.value)}
                      className="w-full bg-[#111] border border-white/10 text-[10px] px-2 py-1.5 text-white/60 placeholder:text-white/20 outline-none focus:border-[#D4AF37]/40"
                    />
                  </div>

                  {/* IMÁGENES SECUNDARIAS */}
                  <div className="col-span-2 sm:col-span-3">
                    <p className="font-label-caps text-[9px] tracking-wider text-white/40 mb-2">GALERÍA SECUNDARIA</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(form.images ?? []).map((img, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5" onPaste={(e) => handleImagePaste(e, false, idx)}>
                          <div className="relative aspect-[3/4] bg-[#111] border border-white/10 group overflow-hidden flex items-center justify-center">
                            {img ? (
                              <>
                                <Image src={img} alt={`Img ${idx}`} fill className="object-cover" unoptimized={img.startsWith('/uploads/')} />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                  <div className="flex gap-1">
                                    <button type="button" onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-[#D4AF37] disabled:opacity-20 transition-colors"><span className="material-symbols-outlined" style={{fontSize:14}}>arrow_back</span></button>
                                    <button type="button" onClick={() => promoteToMain(idx)} className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-[#D4AF37] transition-colors" title="Hacer portada"><span className="material-symbols-outlined" style={{fontSize:14}}>vertical_align_top</span></button>
                                    <button type="button" onClick={() => moveImage(idx, 'down')} disabled={idx === (form.images?.length ?? 0) - 1} className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-[#D4AF37] disabled:opacity-20 transition-colors"><span className="material-symbols-outlined" style={{fontSize:14}}>arrow_forward</span></button>
                                  </div>
                                  <button type="button" onClick={() => updateForm('images', (form.images ?? []).filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 text-[9px] font-label-caps mt-1 tracking-wider border-b border-transparent hover:border-red-400">ELIMINAR</button>
                                </div>
                              </>
                            ) : (
                               <label className="cursor-pointer flex flex-col items-center text-white/20 hover:text-white/50 transition-colors w-full h-full justify-center">
                                 <span className="material-symbols-outlined mb-1" style={{fontSize:20}}>upload</span>
                                 <span className="text-[8px] font-label-caps">SUBIR</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], false, idx)} />
                               </label>
                            )}
                          </div>
                          <input 
                            type="url" placeholder="URL..." value={img} onChange={e => { const next = [...(form.images ?? [])]; next[idx] = e.target.value; updateForm('images', next) }}
                            className="w-full bg-[#111] border border-white/10 text-[9px] px-2 py-1.5 text-white/50 placeholder:text-white/20 outline-none focus:border-white/30"
                          />
                        </div>
                      ))}
                      {/* Add New Gallery Image Button */}
                      <button 
                        type="button" 
                        onClick={() => updateForm('images', [...(form.images ?? []), ''])}
                        className="aspect-[3/4] bg-[#0A0A0A] border border-dashed border-white/15 flex flex-col items-center justify-center text-white/30 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors group"
                      >
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform mb-1">add</span>
                        <span className="font-label-caps text-[9px] tracking-wider">AÑADIR OTRA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30 mb-4 pb-2 border-b border-white/8">IDENTIDAD Y ETIQUETAS</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">NOMBRE DEL RELOJ *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="Ej: Casio Vintage Silver"
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">SKU (DISEÑO/MODELO) *</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={e => handleSkuChange(e.target.value)}
                      placeholder="Ej: ev-19-a3"
                      className="w-full bg-[#111] border border-white/10 text-[#D4AF37] text-sm px-4 py-3 font-mono outline-none focus:border-[#D4AF37]/40"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">SLUG</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => updateForm('slug', e.target.value)}
                      className="w-full bg-[#111] border border-white/10 text-white/30 text-sm px-4 py-3 font-mono outline-none"
                    />
                  </div>
                </div>
                
                {/* ── Etiquetas ── */}
                <div className="mt-4">
                  <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">ETIQUETAS (TAGS) - Presiona Enter o clic en Añadir</label>
                  <div className="bg-[#111] border border-white/10 p-2 flex flex-wrap gap-2 items-center focus-within:border-[#D4AF37]/40 transition-colors">
                    {(form.tags ?? []).map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 font-label-caps text-[9px] tracking-widest">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-white ml-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
                        </button>
                      </span>
                    ))}
                    <div className="flex flex-1 min-w-[120px] items-center">
                      <input 
                        id="tag-input"
                        type="text" 
                        placeholder={(!form.tags || form.tags.length === 0) ? "Ej: NEW, LIMITED, HOT..." : "Añadir más..."}
                        onKeyDown={handleTagKeyDown}
                        className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder:text-white/20"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          const input = document.getElementById('tag-input') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const val = input.value.trim()
                            if (!(form.tags ?? []).includes(val)) {
                              updateForm('tags', [...(form.tags ?? []), val])
                            }
                            input.value = ''
                          }
                        }}
                        className="text-[#D4AF37] text-[10px] font-label-caps hover:text-white px-2"
                      >
                        AÑADIR
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/8">
                  <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30">CATEGORIZACIÓN *</p>
                  <p className="text-[#D4AF37]/50 text-[9px] font-light italic">Marca › Colección › Diseño</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-label-caps text-[10px] tracking-[0.15em] text-white/45">MARCA</label>
                      <button type="button" onClick={addQuickBrand} className="text-[#D4AF37] text-[9px]">+ NUEVA</button>
                    </div>
                    <select
                      value={form.category.brandId}
                      onChange={e => handleHierarchyBrandChange(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3"
                    >
                      <option value="">Seleccionar marca…</option>
                      {watchBrands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-label-caps text-[10px] tracking-[0.15em] text-white/45">COLECCIÓN</label>
                      <button type="button" onClick={addQuickCollection} disabled={!form.category.brandId} className="text-[#D4AF37] text-[9px] disabled:opacity-20">+ NUEVA</button>
                    </div>
                    <select
                      value={form.category.collectionId}
                      onChange={e => handleCollectionChange(e.target.value)}
                      disabled={!form.category.brandId}
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3"
                    >
                      <option value="">Seleccionar colección…</option>
                      {collections.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                  <p className="text-white/40 text-[10px] font-light leading-relaxed">
                    <span className="text-[#D4AF37] font-medium block mb-1">TIP DE CARGA:</span>
                    Para organizar <b>Casio Vintage {form.sku || 'ev-19-a3'}</b>:<br/>
                    1. Marca: Casio | 2. Colección: Vintage | 3. SKU: {form.sku || 'ev-19-a3'}
                  </p>
                </div>
              </section>

              <section>
                <p className="font-label-caps text-[9px] tracking-[0.2em] text-white/30 mb-4 pb-2 border-b border-white/8">PRECIOS (₲)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">PRECIO NORMAL *</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={e => updateForm('price', Number(e.target.value))}
                      className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 tabular-nums outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/45 mb-2">PRECIO OFERTA</label>
                    <input
                      type="number"
                      value={form.salePrice ?? ''}
                      onChange={e => updateForm('salePrice', e.target.value === '' ? undefined : Number(e.target.value))}
                      className="w-full bg-[#111] border border-white/10 text-[#D4AF37] text-sm px-4 py-3 tabular-nums outline-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-white/8 sticky bottom-0 bg-[#0e0e0e]">
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-white/10 text-white/40 font-label-caps text-[10px]">CANCELAR</button>
              <button
                onClick={handleModalSave}
                disabled={saving || !form.name || !form.sku || !form.price || !form.category.brandId || !form.category.collectionId}
                className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.18em] disabled:opacity-30"
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

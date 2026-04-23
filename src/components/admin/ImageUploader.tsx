'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'

interface ImageUploaderProps {
  label?: string
  value: string
  onChange: (url: string) => void
}

export default function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState(value)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
    onChange(e.target.value)
    setError('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.url) {
        setUrlInput(data.url)
        onChange(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block font-label-caps text-[10px] tracking-[0.15em] text-white/50">
          {label}
        </label>
      )}

      {value && (
        <div className="relative w-full h-44 bg-[#0e0e0e] overflow-hidden border border-white/10">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="500px"
            unoptimized={value.startsWith('/uploads/')}
          />
        </div>
      )}

      <input
        type="url"
        value={urlInput}
        onChange={handleUrlChange}
        placeholder="https://example.com/image.jpg"
        className="w-full bg-[#0e0e0e] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37]/40 placeholder:text-white/25 transition-colors"
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/8" />
        <span className="font-label-caps text-[9px] text-white/25 tracking-[0.15em]">OR UPLOAD</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      <label className={`flex items-center justify-center gap-3 border border-white/10 py-3 cursor-pointer hover:border-white/25 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <span className="material-symbols-outlined text-white/40" style={{ fontSize: '16px' }}>
          {uploading ? 'hourglass_empty' : 'upload'}
        </span>
        <span className="font-label-caps text-[10px] tracking-[0.15em] text-white/40">
          {uploading ? 'UPLOADING...' : 'UPLOAD FROM DEVICE'}
        </span>
      </label>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

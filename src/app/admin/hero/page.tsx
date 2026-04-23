'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/publicidad/hero')
  }, [router])

  return (
    <div className="p-10 flex items-center gap-3">
      <span className="material-symbols-outlined text-white/30 animate-spin" style={{ fontSize: '20px' }}>refresh</span>
      <span className="text-white/30 text-sm">Redirigiendo...</span>
    </div>
  )
}

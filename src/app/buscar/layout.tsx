import { Suspense } from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import Header from '@/components/Header'
import type { SiteData } from '@/lib/types'

export const metadata = {
  title: 'Buscar Relojes | GS Relojes',
  description: 'Busca entre nuestra colección de relojes de lujo. Filtra por marca, colección, precio y estilo.',
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  let navbar = { brandName: 'GS RELOJES', links: [] as { id: string; label: string; href: string }[] }
  let announcements: string[] = []
  try {
    const dataPath = path.join(process.cwd(), 'src/data/site-data.json')
    const data: SiteData = JSON.parse(readFileSync(dataPath, 'utf-8'))
    navbar = data.navbar
    announcements = data.announcements ?? []
  } catch {}

  return (
    <>
      <Header navbar={navbar} announcements={announcements} />
      <Suspense fallback={
        <div className="min-h-screen bg-[#0A0A0A] pt-20 flex items-center justify-center">
          <span className="material-symbols-outlined text-white/20 animate-spin" style={{ fontSize: '32px' }}>refresh</span>
        </div>
      }>
        {children}
      </Suspense>
    </>
  )
}

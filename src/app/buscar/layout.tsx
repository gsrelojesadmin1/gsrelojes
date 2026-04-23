import { Suspense } from 'react'

export const metadata = {
  title: 'Buscar Relojes | GS Relojes',
  description: 'Busca entre nuestra colección de relojes de lujo. Filtra por marca, colección, precio y estilo.',
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-white/20 animate-spin" style={{ fontSize: '32px' }}>refresh</span>
          <p className="text-white/30 text-sm font-light">Cargando resultados...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

'use client'

import Link from 'next/link'

const publicidadSections = [
  {
    href: '/admin/publicidad/hero',
    label: 'Hero',
    icon: 'panorama',
    desc: 'Edita el título, subtítulo, imagen de fondo y botones del hero principal.',
  },
  {
    href: '/admin/publicidad/bento',
    label: 'Bento Grid',
    icon: 'grid_view',
    desc: 'Gestiona las tarjetas del grid bento: añade, edita o elimina imágenes y textos.',
  },
]

export default function PublicidadPage() {
  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-10">
        <p className="font-label-caps text-[10px] tracking-[0.25em] text-[#D4AF37] mb-3">
          ADMIN / PUBLICIDAD
        </p>
        <h1 className="text-white text-2xl font-light">Publicidad</h1>
        <p className="text-white/35 text-sm mt-2 font-light">
          Gestiona el contenido visual y publicitario de la tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {publicidadSections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="group bg-[#111] border border-white/8 p-7 hover:border-[#D4AF37]/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 group-hover:bg-[#D4AF37]/10 transition-colors">
                <span
                  className="material-symbols-outlined text-white/40 group-hover:text-[#D4AF37] transition-colors"
                  style={{ fontSize: '20px' }}
                >
                  {s.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-label-caps text-[11px] tracking-[0.15em] text-white/80 group-hover:text-white mb-2 transition-colors">
                  {s.label.toUpperCase()}
                </p>
                <p className="text-white/30 text-xs font-light leading-relaxed">{s.desc}</p>
              </div>
              <span
                className="material-symbols-outlined text-white/15 group-hover:text-[#D4AF37]/50 transition-colors"
                style={{ fontSize: '18px' }}
              >
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

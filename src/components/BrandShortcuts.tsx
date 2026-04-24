import type { BrandShortcut } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface BrandShortcutsProps {
  shortcuts?: BrandShortcut[]
}

export default function BrandShortcuts({ shortcuts = [] }: BrandShortcutsProps) {
  if (shortcuts.length === 0) return null

  return (
    <section className="py-16 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="flex flex-col items-center mb-10">
        <p className="font-label-caps text-[9px] tracking-[0.3em] text-white/25 mb-2">NAVEGACIÓN</p>
        <h2 className="font-label-caps text-[12px] tracking-[0.3em] text-[#D4AF37] text-center">
          COLECCIONES EXCLUSIVAS
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-5">
        {shortcuts.map(shortcut => (
          <ShortcutCard key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </section>
  )
}

function ShortcutCard({ shortcut }: { shortcut: BrandShortcut }) {
  return (
    <Link
      href={shortcut.link}
      className="group relative overflow-hidden aspect-[16/9] border border-white/8 hover:border-[#D4AF37]/35 transition-colors duration-500 bg-[#0e0e0e]"
    >
      <Image
        src={shortcut.image}
        alt={shortcut.name}
        fill
        className="object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 ease-out"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-1">
          <span className="font-label-caps text-[8px] tracking-[0.2em] text-[#D4AF37]/80">
            VER COLECCIÓN
          </span>
          <span className="material-symbols-outlined text-[#D4AF37]/80" style={{ fontSize: 10 }}>
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  )
}

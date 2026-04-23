import Image from 'next/image'
import type { HeroData } from '@/lib/types'

interface HeroSectionProps {
  hero: HeroData
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const titleLines = hero.title.split('\n')

  return (
    <section className="relative h-screen min-h-[700px] max-h-[980px] w-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={hero.backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-[#0A0A0A]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <p
          className="font-label-caps text-[10px] tracking-[0.45em] text-[#D4AF37] mb-8"
          style={{ letterSpacing: '0.45em' }}
        >
          {hero.badge}
        </p>

        <h1
          className="font-headline-display text-white mb-8 leading-[0.92]"
          style={{
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontWeight: 200,
            letterSpacing: '-0.025em',
          }}
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h1>

        <p
          className="text-white/55 max-w-md mx-auto mb-12 font-light leading-relaxed"
          style={{ fontSize: '15px', letterSpacing: '0.01em' }}
        >
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-10 py-4 bg-[#D4AF37] text-[#0A0A0A] font-label-caps text-[10px] tracking-[0.25em] hover:bg-[#f2ca50] transition-colors duration-200">
            {hero.cta1Label}
          </button>
          <button className="px-10 py-4 border border-white/20 text-white/70 font-label-caps text-[10px] tracking-[0.25em] hover:border-white/40 hover:text-white transition-colors duration-200">
            {hero.cta2Label}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="font-label-caps text-[8px] tracking-[0.3em] text-white">SCROLL</span>
        <div className="w-px h-10 bg-white/40" />
      </div>
    </section>
  )
}

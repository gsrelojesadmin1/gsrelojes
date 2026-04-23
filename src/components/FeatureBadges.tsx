import type { FeatureBadge } from '@/lib/types'

interface FeatureBadgesProps {
  badges?: FeatureBadge[]
}

export default function FeatureBadges({ badges = [] }: FeatureBadgesProps) {
  if (badges.length === 0) return null

  return (
    <section className="py-12 px-6 lg:px-12 max-w-[1440px] mx-auto border-b border-white/5 bg-[#080808]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {badges.map(badge => (
          <div key={badge.id} className="flex flex-col items-center text-center gap-4 group">
            <div className="w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/50 group-hover:bg-[#1a1a1a] transition-all duration-500">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                {badge.icon || 'local_shipping'}
              </span>
            </div>
            <div>
              <h4 className="font-label-caps text-[11px] tracking-[0.2em] text-white/90 mb-2">{badge.title}</h4>
              <p className="text-white/40 text-[11px] font-light leading-relaxed max-w-[200px] mx-auto">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

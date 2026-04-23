import type { FooterData } from '@/lib/types'

interface FooterProps {
  footer: FooterData
}

export default function Footer({ footer }: FooterProps) {
  return (
    <footer className="bg-[#060606] border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-16">
        <div className="flex flex-col items-center gap-8">
          <p className="font-label-caps text-[12px] tracking-[0.45em] text-white/60">
            {footer.brandName}
          </p>

          <nav className="flex flex-wrap justify-center gap-6 md:gap-12" aria-label="Footer navigation">
            {footer.links.map(link => (
              <a
                key={link.id}
                href={link.href}
                className="font-label-caps text-[9px] tracking-[0.18em] text-white/25 hover:text-[#D4AF37] transition-colors duration-300"
              >
                {link.label.toUpperCase()}
              </a>
            ))}
          </nav>

          <div className="w-full h-px bg-white/5" />

          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-8">
              {[
                { icon: 'share', label: 'Social' },
                { icon: 'mail', label: 'Email' },
                { icon: 'call', label: 'Phone' },
              ].map(({ icon, label }) => (
                <a
                  key={icon}
                  href="#"
                  className="text-white/20 hover:text-white/60 transition-colors"
                  aria-label={label}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                </a>
              ))}
            </div>

            <p className="font-label-caps text-[9px] tracking-[0.15em] text-white/20">
              {footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

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
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-[#D4AF37] transition-colors" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-[#D4AF37] transition-colors" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </a>
              <a href="https://wa.me/595981123456" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-[#D4AF37] transition-colors" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
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

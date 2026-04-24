'use client'

import { useMemo } from 'react'

export default function AnnouncementBar({ messages = [] }: { messages?: string[] }) {
  // Repetir mensajes para asegurar que el scroll sea continuo
  const content = useMemo(() => {
    if (!messages || messages.length === 0) return null
    const list = [...messages]
    // Repetimos el bloque para crear el efecto infinito
    return (
      <div className="flex whitespace-nowrap animate-marquee-horizontal">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center">
            {list.map((msg, idx) => (
              <div key={idx} className="flex items-center">
                <span className="font-label-caps text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] font-bold px-6 sm:px-10">
                  {msg.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }, [messages])

  if (!messages || messages.length === 0) return null

  return (
    <div className="w-full bg-[#D4AF37] text-[#0A0A0A] overflow-hidden relative h-6 sm:h-8 flex items-center z-[60] border-b border-black/5">
      {content}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee-horizontal {
          display: flex;
          animation: marquee-horizontal 40s linear infinite;
        }
        .animate-marquee-horizontal:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}

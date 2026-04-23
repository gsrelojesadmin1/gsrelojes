import Image from 'next/image'
import type { BentoItem } from '@/lib/types'

interface BentoGridProps {
  items: BentoItem[]
}

export default function BentoGrid({ items }: BentoGridProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-12 py-32">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[700px]">
        {items.map((item) => (
          <div
            key={item.id}
            className={`${item.large ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2'} group relative overflow-hidden bg-surface-container-low`}
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              className={`object-cover ${item.large ? 'opacity-70' : 'opacity-50'} group-hover:scale-105 transition-transform duration-700`}
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
            <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
              <h3 className={`${item.large ? 'font-headline-lg' : 'font-headline-md'} text-white mb-2`}>{item.title}</h3>
              {item.description && (
                <p className="font-body-md text-secondary mb-6 max-w-xs">{item.description}</p>
              )}
              <a className="font-label-caps text-primary border-b border-primary w-fit pb-1" href="#">
                {item.linkLabel}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

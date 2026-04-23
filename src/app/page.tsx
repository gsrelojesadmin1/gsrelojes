import { readFileSync } from 'fs'
import path from 'path'
import type { SiteData } from '@/lib/types'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import BentoGrid from '@/components/BentoGrid'
import FeatureBadges from '@/components/FeatureBadges'
import BrandShortcuts from '@/components/BrandShortcuts'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

function getSiteData(): SiteData {
  const dataPath = path.join(process.cwd(), 'src/data/site-data.json')
  return JSON.parse(readFileSync(dataPath, 'utf-8'))
}

export default function Home() {
  const data = getSiteData()

  return (
    <>
      <Header navbar={data.navbar} announcements={data.announcements} />
      <main className="pt-28">
        <HeroSection slides={data.heroSlides ?? [data.hero]} />
        
        {/* Nuevas secciones de confianza y atajos */}
        <FeatureBadges badges={data.featureBadges} />
        <BrandShortcuts shortcuts={data.brandShortcuts} />
        
        <ProductGrid products={data.products} />
        
        <BentoGrid items={data.bentoItems ?? []} />
      </main>
      <Footer footer={data.footer} />
    </>
  )
}

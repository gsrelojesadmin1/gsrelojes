import { readFileSync } from 'fs'
import path from 'path'
import type { SiteData } from '@/lib/types'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import BentoGrid from '@/components/BentoGrid'
import CategoryCarousel from '@/components/CategoryCarousel'
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
      <Header navbar={data.navbar} />
      <main className="pt-20">
        <HeroSection hero={data.hero} />
        <BentoGrid />
        <CategoryCarousel />
        <ProductGrid products={data.products} />
      </main>
      <Footer footer={data.footer} />
    </>
  )
}

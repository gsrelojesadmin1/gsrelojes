import { readFileSync } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { SiteData } from '@/lib/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BrandCatalog from './BrandCatalog'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ brandId: string }>
}

function getSiteData(): SiteData {
  const dataPath = path.join(process.cwd(), 'src/data/site-data.json')
  return JSON.parse(readFileSync(dataPath, 'utf-8'))
}

export default async function BrandPage({ params }: Props) {
  const { brandId } = await params
  const data = getSiteData()

  const brand = data.watchBrands.find(b => b.id === brandId)
  if (!brand) notFound()

  const products = data.products.filter(p => p.category.brandId === brandId)

  return (
    <>
      <Header navbar={data.navbar} announcements={data.announcements} />
      <main className="pt-28">
        <BrandCatalog brand={brand} products={products} />
      </main>
      <Footer footer={data.footer} />
    </>
  )
}

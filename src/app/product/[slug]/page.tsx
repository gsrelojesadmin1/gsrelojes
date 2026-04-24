import { readFileSync } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { SiteData } from '@/lib/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetail from './ProductDetail'

export const dynamic = 'force-dynamic'

function getSiteData(): SiteData {
  const dataPath = path.join(process.cwd(), 'src/data/site-data.json')
  return JSON.parse(readFileSync(dataPath, 'utf-8'))
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const data = getSiteData()
  const product = data.products.find(p => p.slug === slug)

  if (!product) notFound()

  const brand = data.watchBrands.find(b => b.id === product.category.brandId)
  const collection = brand?.collections.find(c => c.id === product.category.collectionId)
  const model = collection?.models.find(m => m.id === product.category.modelId)

  // Recommended: same brand first, then other products — max 4
  const recommended = [
    ...data.products.filter(
      p => p.id !== product.id && p.category.brandId === product.category.brandId
    ),
    ...data.products.filter(
      p => p.id !== product.id && p.category.brandId !== product.category.brandId
    ),
  ].slice(0, 4)

  return (
    <>
      <Header navbar={data.navbar} announcements={data.announcements} />
      <main className="pt-[72px]">
        <ProductDetail
          product={product}
          recommended={recommended}
          breadcrumb={{
            brand: brand?.name ?? product.brand,
            collection: collection?.name,
            model: model?.name,
          }}
        />
      </main>
      <Footer footer={data.footer} />
    </>
  )
}

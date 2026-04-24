import type { Metadata } from 'next'
import { Inter, Noto_Serif } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import CartDrawer from '@/components/CartDrawer'
import LayoutTopBar from '@/components/LayoutTopBar'
import ToastProvider from '@/components/ToastProvider'
import WhatsAppButton from '@/components/WhatsAppButton'
import { readFileSync } from 'fs'
import path from 'path'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GS Relojes | Horological Excellence',
  description: 'Experience the apex of Swiss engineering and artisanal craftsmanship. A legacy forged in gold and steel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let announcements: string[] = []
  try {
    const dataPath = path.join(process.cwd(), 'src/data/site-data.json')
    const siteData = JSON.parse(readFileSync(dataPath, 'utf-8'))
    announcements = siteData.announcements ?? []
  } catch (e) {
    // Ignore
  }

  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} ${notoSerif.variable} font-body-md bg-background text-on-surface antialiased`}
        style={{ backgroundColor: '#0A0A0A', color: '#e5e2e1' }}
      >
        <LayoutTopBar messages={announcements} />
        <FavoritesProvider>
          <CartProvider>
            <div className={announcements.length > 0 ? "pt-8" : ""}>
              {children}
            </div>
            <CartDrawer />
            <ToastProvider />
            <WhatsAppButton />
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  )
}

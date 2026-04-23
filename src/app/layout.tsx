import type { Metadata } from 'next'
import { Inter, Noto_Serif } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import CartDrawer from '@/components/CartDrawer'
import AnnouncementBar from '@/components/AnnouncementBar'
import { readFileSync } from 'fs'
import path from 'path'
import './globals.css'

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
        <div className="fixed top-0 w-full z-[70]">
          <AnnouncementBar messages={announcements} />
        </div>
        <FavoritesProvider>
          <CartProvider>
            <div className={announcements.length > 0 ? "pt-8" : ""}>
              {children}
            </div>
            <CartDrawer />
            
            {/* WhatsApp Floating Button */}
            <a
              href="https://wa.me/595981123456"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform duration-300"
              aria-label="Contactar por WhatsApp"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 0C5.385 0 0 5.385 0 12.03c0 2.122.55 4.195 1.597 6.02L.15 23.4l5.485-1.442A11.968 11.968 0 0 0 12.032 24c6.645 0 12.03-5.385 12.03-12.03S18.677 0 12.031 0zm0 21.996a9.96 9.96 0 0 1-5.083-1.39l-.364-.216-3.774.99 1.01-3.68-.237-.378A9.957 9.957 0 0 1 2.003 12.03c0-5.531 4.5-10.03 10.028-10.03 5.53 0 10.03 4.499 10.03 10.03s-4.5 10.028-10.03 10.026zm5.503-7.514c-.302-.15-1.785-.882-2.062-.982-.276-.101-.478-.15-.68.15s-.781.982-.958 1.183c-.176.202-.353.227-.655.076a8.212 8.212 0 0 1-2.42-1.493 9.074 9.074 0 0 1-1.674-2.083c-.176-.302-.019-.465.132-.616.136-.136.302-.352.453-.528.151-.176.201-.302.302-.503.101-.202.05-.378-.026-.529-.075-.15-.68-1.637-.932-2.241-.246-.59-.496-.51-.68-.52-.176-.01-.378-.01-.58-.01-.202 0-.528.075-.805.378-.277.302-1.057 1.031-1.057 2.516s1.082 2.92 1.233 3.12c.15.202 2.128 3.249 5.155 4.553.72.31 1.28.496 1.718.635.723.23 1.382.197 1.901.12.58-.086 1.785-.73 2.036-1.434.252-.705.252-1.31.176-1.435-.075-.126-.277-.202-.579-.353z" />
              </svg>
            </a>
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  )
}

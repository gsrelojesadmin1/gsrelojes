import { readFileSync } from 'fs'
import path from 'path'
import type { SiteData } from '@/lib/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

function getSiteData(): SiteData {
  const dataPath = path.join(process.cwd(), 'src/data/site-data.json')
  return JSON.parse(readFileSync(dataPath, 'utf-8'))
}

export default function PrivacyPolicy() {
  const data = getSiteData()

  return (
    <>
      <Header navbar={data.navbar} announcements={data.announcements} />
      <main className="pt-32 pb-20 px-8 lg:px-12 max-w-[800px] mx-auto">
        <h1 className="font-display-lg text-4xl mb-12 text-[#D4AF37]">Política de Privacidad</h1>
        
        <div className="space-y-8 text-white/70 font-body-md leading-relaxed">
          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">1. Introducción</h2>
            <p>
              En GS RELOJES, valoramos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos y compartimos su información cuando visita o realiza una compra en nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">2. Información que Recopilamos</h2>
            <p>
              Cuando visita el Sitio, recopilamos automáticamente cierta información sobre su dispositivo, incluida información sobre su navegador web, dirección IP, zona horaria y algunas de las cookies que están instaladas en su dispositivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">3. Cómo Utilizamos su Información</h2>
            <p>
              Utilizamos la información del pedido que recopilamos en general para cumplir con cualquier pedido realizado a través del Sitio (incluido el procesamiento de su información de pago, la organización del envío y la entrega de facturas y/o confirmaciones de pedido).
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">4. Seguridad</h2>
            <p>
              Para proteger su información personal, tomamos precauciones razonables y seguimos las mejores prácticas de la industria para asegurarnos de que no se pierda, utilice mal, acceda, revele, altere o destruya de manera inapropiada.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">5. Cambios</h2>
            <p>
              Podemos actualizar esta política de privacidad periódicamente para reflejar, por ejemplo, cambios en nuestras prácticas o por otras razones operativas, legales o reglamentarias.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">6. Contacto</h2>
            <p>
              Para obtener más información sobre nuestras prácticas de privacidad, si tiene preguntas o si desea presentar una queja, comuníquese con nosotros por correo electrónico a contacto@gsrelojes.com.
            </p>
          </section>
        </div>
      </main>
      <Footer footer={data.footer} />
    </>
  )
}

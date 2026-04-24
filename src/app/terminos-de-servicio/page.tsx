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

export default function TermsOfService() {
  const data = getSiteData()

  return (
    <>
      <Header navbar={data.navbar} announcements={data.announcements} />
      <main className="pt-32 pb-20 px-8 lg:px-12 max-w-[800px] mx-auto">
        <h1 className="font-display-lg text-4xl mb-12 text-[#D4AF37]">Términos de Servicio</h1>
        
        <div className="space-y-8 text-white/70 font-body-md leading-relaxed">
          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">1. Términos</h2>
            <p>
              Al acceder al sitio web en gsrelojes.com, usted acepta estar sujeto a estos términos de servicio, a todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">2. Licencia de Uso</h2>
            <p>
              Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de GS RELOJES para visualización transitoria personal y no comercial solamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">3. Descargo de Responsabilidad</h2>
            <p>
              Los materiales en el sitio web de GS RELOJES se proporcionan "tal cual". GS RELOJES no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluidas, sin limitación, las garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular o no infracción de propiedad intelectual u otra violación de derechos.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">4. Limitaciones</h2>
            <p>
              En ningún caso GS RELOJES o sus proveedores serán responsables de los daños (incluidos, sin limitación, los daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surjan del uso o la imposibilidad de usar los materiales en el sitio web de GS RELOJES.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">5. Precisión de los Materiales</h2>
            <p>
              Los materiales que aparecen en el sitio web de GS RELOJES podrían incluir errores técnicos, tipográficos o fotográficos. GS RELOJES no garantiza que ninguno de los materiales en su sitio web sea preciso, completo o actual.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4 font-label-caps tracking-wider">6. Enlaces</h2>
            <p>
              GS RELOJES no ha revisado todos los sitios vinculados a su sitio web y no es responsable de los contenidos de ninguno de dichos sitios vinculados. La inclusión de cualquier enlace no implica el respaldo de GS RELOJES al sitio.
            </p>
          </section>
        </div>
      </main>
      <Footer footer={data.footer} />
    </>
  )
}

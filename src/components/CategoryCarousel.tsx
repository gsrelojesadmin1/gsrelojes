import Image from 'next/image'

const categories = [
  {
    name: 'VESTIR',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-7mDR2K929_IjVXzhwCAI1IPWjiGYcNKRGqHDmRpaCac1AHnlsaoET8iY1sNNtySWMyM0IByybnIg88xkS1KWRx6zRICvj39xF4JdJ14l_0Ue-SG9y9gSxk2BUD_rw0jEployxXlwPaPrY6q0eC-Y0--zR__O8qelErjli-l8_-9Woy1DlyJM7cA_z0GWZcMIGBRaCKDxFiFqlDWgF3fXHwwp1YKg4x-w-lmtRBlEtci2miX8hSKyYKTbD7bE0Nq0KnRS4D7WWO4',
    alt: 'Elegante reloj dorado de esfera blanca y correa de cuero negro sobre tela de seda',
  },
  {
    name: 'DEPORTE',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqE24e0Td9pdtLdjgdRUa95MEPzseH5MWH1pmsaiw_r0gbjscfwNXpbuhvckOuvryJKhLBoBrx2ObNnk379X209G_nR2gGIJNDP9yYlWWr8Hpxeezn2B8HfnnZOCoXTPjLz6iinolFAq2tGx9LjaTWc_CNISAyBBwRVM_ZLnKDXpE8xuNHKja0bW9i1Wo5SxJ2LZynN-fEtefFpq1oEX0ugwh8PcSH9fiTH4rzaVMjSOnoLo9RAc11n1WR-sBQC9-WqJFEsxVoEAY',
    alt: 'Cronógrafo deportivo en acero con bisel taquímetro en la muñeca de un atleta profesional',
  },
  {
    name: 'BUCEO',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXZAtuQPbbCvQTyFR7w1WArApaG8pJMCYMDxmfJhLLgE_tmRq6pb9NeyRPAF__uE6cLABVWj4Eic35X0mPoRmmF_agXqI7_OKhWmZdAceOrraDL2f4mUaZRSDW-g-1bWZQkWaOYlnSMEXnYAzN95MsuzDpN_CDFXsgw5cKsmVsYo95lBTwYFSaa0N1M4tuxD9z--dCq3kAH6363XdqCt1iFeNM0nN-2MrPHCrR8O8xPyimmo_oar9QN0XK3fLJPxDnniEIwfyhRig',
    alt: 'Reloj de buceo resistente con esfera luminosa y bisel giratorio, parcialmente sumergido en agua',
  },
  {
    name: 'AVIADOR',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOKCenlF0nSH1rV-dikdi9LokRDMKPa46-VFooQl5o64UJHYzdKMBXLJ9LJ9ZJgw4IiHDg7aOC9j_NAXH0IgPH7nW3HZUrDhtTYnx_WgSQMRUtVG1h4u8rF7rzC7c0jXKojPDpvg10_Ul0RDjjAuu6EKCUB_4kVyPrUmJNGbFrHGesRlOICRNOe6m4Z4b5GqYgBcJo6CPIpixbGLjsm1yDwDX5jczlsyCjn4pDeUdpIyvoYS54_LninQ3R5gSAZJLICLujM4Qxc7A',
    alt: 'Reloj de piloto de gran esfera con numerales claros y correa gruesa de cuero marrón',
  },
  {
    name: 'DIGITAL',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmvmSiaKul2rWxbPsFpDjcVglLTHKFXZgsl0bnU6KxNJ58Zysp4gL_8jL3hLS6E-dgLl_UXOCzzyM1UyeRQVy3s83zow09D1we0ZRffiHz6qOgNzcAl0colATq2wbp3RVw5Vli25ZphhU-IKXtXGMJBhpuoTGTCY3ZMHEY74JOgcpj1U_L0ggl7IsKabZNX-Sdab73pN295Yl7WsgG5EYVul_FwAihsBzeplHo1bQD2KPwjR_QFjFRl5hHU8vmZLjR01cjn81dmag',
    alt: 'Reloj digital premium con carcasa metálica y pantalla de alta resolución con métricas avanzadas',
  },
]

export default function CategoryCarousel() {
  return (
    <section className="bg-surface-container-lowest py-32 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-12">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="font-label-caps text-primary mb-4">SELECCIÓN CURADA</p>
            <h2 className="font-headline-lg text-white">EXPLORAR POR CATEGORÍA</h2>
          </div>
          <div className="flex gap-4">
            <button className="p-4 border border-white/10 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-white">arrow_back</span>
            </button>
            <button className="p-4 border border-white/10 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-white">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="flex gap-12 overflow-x-auto pb-8 no-scrollbar">
          {categories.map((cat) => (
            <div key={cat.name} className="flex-none w-64 text-center group cursor-pointer">
              <div className="relative w-64 h-80 mb-6 overflow-hidden bg-surface-container-high flex items-center justify-center p-8">
                <Image
                  src={cat.src}
                  alt={cat.alt}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-500 p-8"
                  sizes="256px"
                />
              </div>
              <h4 className="font-label-caps text-white text-[14px]">{cat.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

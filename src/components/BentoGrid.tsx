import Image from 'next/image'

const bentoItems = [
  {
    title: 'Modern Classics',
    description: 'Refined simplicity for the contemporary gentleman.',
    linkLabel: 'EXPLORE SERIES',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuG3B9V0praS4HDK-BIzpl7RvOquKgAg86tN3uoHeETVKeJe4EkdLLOBSNOKJpgolM5sji0SRcn1qCSovdFrzUaX9qBcA7WD0xWpm_RJQChlqpOBOiZOolgNPdViXlHCXV4TA-rtWPz_8-UN1HJetErlkKReafxSL6d4wtQ7uGCeqhV_JALIsn_eVJN2FYkRtZZXLCyiPQuEC7DD1ZEPp5PD9WIPGr6aOFAh8ZgTyZRNOQ9Z4XRSq4dqtg_dKUJN7SumX2T2tYwHw',
    large: true,
    titleClass: 'font-headline-lg',
  },
  {
    title: 'Limited Editions',
    description: null,
    linkLabel: 'VIEW RARITIES',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBN5VxuE9T7ZnBegqcETi4_PD1Z-xJXXLvHKULQZRLVopmBi6bhv-gSfY8JzmJPLXIloZenFFhRsgczqoL_bm2w9Slmzn14n27iZFuqut9mjzPLEvCyrhWfqn7dzH-ckEHdzWQ9RNPDqsSb3Pq2f0KvpyRl4B9LLBNJK4WJP9BC8jLT_Uf8XPOTDm4qW7ZXQWpKPDMbcR5HK9g81yYjPgCwb5mZY-cEdeic3lcXRlL8-gPfyS0FB41wBy3rbY5faiKvw-c91sX6VtU',
    large: false,
    titleClass: 'font-headline-md',
  },
  {
    title: 'Heritage',
    description: null,
    linkLabel: 'OUR STORY',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBprbIDwucKuPwC-_BsQX3Pedleunf6f8OM1psIvF4L6UrxeKjVn3T6Hah6wspBskM6IJ9njhjy1xfV4W8SoLHEiqzEzB4BPXWdeQn1kpEQfXNYRLOPTk9-1WuTK8uc9ekTmJLBx9STeK_KCNyzMD_6nehizm6HzKdoFJ62YwWUH1zciMtiiVI5Yxknk-JuNmQuk3qKV21t1l0yHeH9blJvHA9MwMqwFISOOz_1LZhq2fnXeK8ijoaYTMut1YXHROe12XaZ5WXyekk',
    large: false,
    titleClass: 'font-headline-md',
  },
]

export default function BentoGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-12 py-32">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[700px]">
        {bentoItems.map((item) => (
          <div
            key={item.title}
            className={`${item.large ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2'} group relative overflow-hidden bg-surface-container-low`}
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              className={`object-cover ${item.large ? 'opacity-70' : 'opacity-50'} group-hover:scale-105 transition-transform duration-700`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
              <h3 className={`${item.titleClass} text-white mb-2`}>{item.title}</h3>
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

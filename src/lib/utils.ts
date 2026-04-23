/** Genera un SKU legible: {BRAND_INITIALS}-{NAME_INITIALS}-{3 dígitos} */
export function generateSku(brand: string, name: string): string {
  const initials = (str: string, max: number) =>
    str
      .split(/\s+/)
      .map(w => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase())
      .filter(Boolean)
      .join('')
      .slice(0, max)
      .padEnd(2, 'X')

  const b = initials(brand, 3)
  const n = initials(name, 3)
  const seq = String(Date.now()).slice(-3)
  return `${b}-${n}-${seq}`
}

/** Genera un slug URL-friendly a partir de marca y nombre */
export function generateSlug(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // elimina acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * slugifyTag — normaliza uma tag arbitrária em um slug URL-safe.
 * Usado pela rota /blog/tag/[tag]/ e por qualquer link que aponte pra lá.
 */
export function slugifyTag(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

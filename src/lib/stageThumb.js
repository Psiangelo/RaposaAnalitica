/**
 * stageThumb — deriva uma URL de thumbnail pra uma etapa.
 *
 * Cascata:
 *  1. stage.coverImage (definido no admin)
 *  2. primeiro block tipo 'link':
 *     - blog        → post.featured_cover ou post.cover
 *     - material    → material.cover
 *     - youtube     → https://img.youtube.com/vi/{id}/maxresdefault.jpg
 *  3. null (caller deve renderizar fallback gráfico)
 */

export function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.replace(/^\//, '').split('/')[0] || null;
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      if (u.pathname.startsWith('/embed/'))  return u.pathname.replace('/embed/', '').split('/')[0];
      if (u.pathname.startsWith('/shorts/')) return u.pathname.replace('/shorts/', '').split('/')[0];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export function deriveStageThumb(stage, { posts = [], materials = [] } = {}) {
  if (!stage) return null;
  if (stage.coverImage) return stage.coverImage;

  for (const b of stage.blocks || []) {
    if (b?.type !== 'link' || !b.link) continue;
    const t = deriveLinkThumb(b.link, { posts, materials });
    if (t) return t;
  }
  return null;
}

/**
 * Deriva thumbnail pra um `link` block individual.
 * Cascata: post.featured_cover → material.cover → YouTube thumbnail → null.
 */
export function deriveLinkThumb(link, { posts = [], materials = [] } = {}) {
  if (!link?.kind || !link?.value) return null;
  const { kind, value } = link;

  if (kind === 'blog') {
    const post = posts.find((p) => (p.slug || p.id) === value);
    if (post?.featured_cover) return post.featured_cover;
    if (post?.cover) return post.cover;
    if (post?.image) return post.image;
  }
  if (kind === 'material') {
    const m = materials.find((x) => x.id === value);
    if (m?.cover) return m.cover;
    if (m?.image) return m.image;
  }
  if (kind === 'youtube') {
    const id = extractYouTubeId(value);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

/** Roman numeral pra "I · II · III" usado em etapas */
const ROMAN_TABLE = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100],  ['XC', 90],  ['L', 50],  ['XL', 40],
  ['X', 10],   ['IX', 9],   ['V', 5],   ['IV', 4], ['I', 1],
];
export function toRoman(n) {
  let num = Math.max(1, Math.floor(Number(n) || 0));
  let out = '';
  for (const [r, v] of ROMAN_TABLE) {
    while (num >= v) { out += r; num -= v; }
  }
  return out;
}

'use client';

/**
 * cartographyGenerators — gera nodes/edges automaticamente a partir
 * de outras fontes (blog, glossário). Usado por CartographyView quando
 * cartography.source !== 'manual'.
 *
 * Convenções comuns:
 *  - node.weight: número arbitrário (grau, popularidade). Quanto maior, maior o nó.
 *  - node.size: derivado de weight quando layout='force'. Manual usa size direto.
 *  - node.tone: 'accent' | 'bright' | 'citrinit' | 'rubedo'
 *  - node.href: link externo opcional para navegação
 */

function slugifyTag(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const TONE_BY_BUCKET = ['accent', 'citrinit', 'bright', 'rubedo'];

/**
 * Gera cartografia de posts do blog.
 *  - 1 nó por post publicado
 *  - edges entre posts que compartilham ≥1 tag
 *  - tamanho do nó = quantidade de tags do post + 1 (cap)
 *  - tom = bucket determinístico baseado na 1ª tag (varia visualmente)
 */
export function cartographyFromBlog(posts = []) {
  const published = (posts || []).filter((p) => !p.status || p.status === 'published');

  const nodes = published.map((p) => {
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const firstTag = tags[0] || 'sem-tag';
    const toneIdx = slugifyTag(firstTag).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % TONE_BY_BUCKET.length;
    return {
      id: `post-${p.slug || p.id}`,
      label: String(p.title || 'Sem título').replace(/\*([^*]+)\*/g, '$1'),
      axiom: (p.excerpt || '').slice(0, 120),
      tone: TONE_BY_BUCKET[toneIdx],
      href: `/blog/${p.slug || p.id}`,
      weight: Math.min(Math.max(tags.length + 1, 1), 6),
      size: 14 + Math.min(tags.length, 6) * 2,
      tags,
      // x/y serão calculados pelo layout force; placeholders pra render manual:
      x: 400 + Math.random() * 200 - 100,
      y: 260 + Math.random() * 200 - 100,
    };
  });

  // Edges entre posts que compartilham ≥1 tag
  const edges = [];
  for (let i = 0; i < published.length; i++) {
    const a = published[i];
    const aTags = new Set((a.tags || []).map(slugifyTag));
    if (aTags.size === 0) continue;
    for (let j = i + 1; j < published.length; j++) {
      const b = published[j];
      const bTags = (b.tags || []).map(slugifyTag);
      const shared = bTags.filter((t) => aTags.has(t));
      if (shared.length > 0) {
        edges.push([
          `post-${a.slug || a.id}`,
          `post-${b.slug || b.id}`,
          shared.length, // peso da aresta
        ]);
      }
    }
  }

  return { nodes, edges };
}

/**
 * Gera cartografia do glossário.
 *  - 1 nó por verbete visível
 *  - edges via related.terms
 *  - tamanho = grau (quantos outros verbetes referenciam ele)
 *  - tom = baseado na categoria
 */
const TONE_BY_GLOSS_CATEGORY = {
  estrutura: 'bright',
  arquetipos: 'citrinit',
  dinamica: 'accent',
  clinica: 'rubedo',
  processo: 'accent',
  alquimia: 'citrinit',
};

export function cartographyFromGlossario(glossario = []) {
  const visible = (glossario || []).filter((g) => !g.hidden);
  const slugs = new Set(visible.map((g) => g.slug));

  // Conta grau (referências entrantes)
  const degree = new Map(visible.map((g) => [g.slug, 0]));
  for (const g of visible) {
    for (const ref of g.related?.terms || []) {
      if (slugs.has(ref)) {
        degree.set(ref, (degree.get(ref) || 0) + 1);
        degree.set(g.slug, (degree.get(g.slug) || 0) + 1);
      }
    }
  }

  const nodes = visible.map((g) => {
    const d = degree.get(g.slug) || 0;
    return {
      id: `gloss-${g.slug}`,
      label: g.term,
      axiom: (g.short || '').slice(0, 120),
      tone: TONE_BY_GLOSS_CATEGORY[g.category] || 'accent',
      href: `/verbetes/${g.slug}`,
      weight: Math.min(Math.max(d + 1, 1), 8),
      size: 14 + Math.min(d, 8) * 2,
      x: 400 + Math.random() * 200 - 100,
      y: 260 + Math.random() * 200 - 100,
    };
  });

  const edges = [];
  const seenPair = new Set();
  for (const g of visible) {
    for (const ref of g.related?.terms || []) {
      if (!slugs.has(ref) || ref === g.slug) continue;
      const key = [g.slug, ref].sort().join('|');
      if (seenPair.has(key)) continue;
      seenPair.add(key);
      edges.push([`gloss-${g.slug}`, `gloss-${ref}`, 1]);
    }
  }

  return { nodes, edges };
}

/**
 * Resolve nodes/edges efetivos de uma cartografia, considerando source.
 * Recebe a cartografia + as fontes externas necessárias.
 */
export function resolveCartographyData(cartography, { posts = [], glossario = [] } = {}) {
  if (!cartography) return { nodes: [], edges: [] };
  if (cartography.source === 'blog') return cartographyFromBlog(posts);
  if (cartography.source === 'glossario') return cartographyFromGlossario(glossario);
  return { nodes: cartography.nodes || [], edges: cartography.edges || [] };
}

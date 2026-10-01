import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
import siteContent from '@/data/site-content.json';
import { glossario } from '@/data/glossario';
import { trilhas as TRILHAS_DEFAULT } from '@/data/trilhas';

const BASE = SITE_URL_FROM_LIB;

function getPublishedPosts() {
  const posts = siteContent?.data?.raposa_admin_blog;
  if (!Array.isArray(posts)) return [];
  return posts.filter((p) => p && (p.slug || p.id) && (!p.status || p.status === 'published'));
}

// Mesma lógica de src/app/estudos/[trilha]/page.js: as trilhas realmente
// publicadas vêm do snapshot (raposa_admin_trilhas), com fallback pro
// default hardcoded em src/data/trilhas.js — e a rota usa slug||id.
function getTrilhas() {
  const stored = siteContent?.data?.raposa_admin_trilhas;
  return Array.isArray(stored) && stored.length > 0 ? stored : TRILHAS_DEFAULT;
}

function slugifyTag(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getUniqueTags() {
  const seen = new Set();
  for (const p of getPublishedPosts()) {
    for (const t of p.tags || []) {
      const slug = slugifyTag(t);
      if (slug) seen.add(slug);
    }
  }
  return Array.from(seen);
}

function toAbsolute(path, priority, changeFrequency, lastModified) {
  // trailingSlash:true no next.config — URL canônica sempre termina em /
  const normalized = path === '' ? '/' : path.endsWith('/') ? path : `${path}/`;
  return {
    url: `${BASE}${normalized}`,
    lastModified: lastModified || new Date(),
    changeFrequency,
    priority,
  };
}

export default function sitemap() {
  const staticRoutes = [
    toAbsolute('',            1.0, 'weekly'),
    toAbsolute('/blog',       0.9, 'weekly'),
    toAbsolute('/verbetes',   0.85, 'weekly'),
    toAbsolute('/trilhas',    0.75, 'weekly'),
    toAbsolute('/servicos',   0.8, 'monthly'),
    toAbsolute('/loja',       0.7, 'weekly'),
    toAbsolute('/newsletter', 0.6, 'monthly'),
    toAbsolute('/sobre',      0.6, 'monthly'),
    toAbsolute('/bio',        0.4, 'monthly'),
    toAbsolute('/privacidade', 0.3, 'yearly'),
    toAbsolute('/cookies',     0.3, 'yearly'),
  ];

  // Posts do blog — um entry por post publicado com lastModified real
  const postRoutes = getPublishedPosts().map((p) => {
    const slug = p.slug || p.id;
    const lm = p.updated_at || p.created_at;
    return toAbsolute(
      `/blog/${slug}`,
      0.8,
      'monthly',
      lm ? new Date(lm) : new Date(),
    );
  });

  // Categorias do blog — um entry por tag única
  const tagRoutes = getUniqueTags().map((tag) =>
    toAbsolute(`/blog/tag/${tag}`, 0.55, 'weekly'),
  );

  // Verbetes do glossário — ~25 landings estáticas de cauda longa,
  // hoje só a raiz /verbetes/ estava no sitemap
  const publicados = siteContent?.data?.raposa_admin_glossario;
  const glossarioRoutes = (Array.isArray(publicados) && publicados.length ? publicados : glossario)
    .filter((g) => g?.slug && !g.hidden)
    .map((g) => toAbsolute(`/verbetes/${g.slug}`, 0.65, 'monthly'));

  // Trilhas de estudo — uma por trilha efetivamente publicada
  const trilhaRoutes = getTrilhas()
    .filter((t) => t?.slug || t?.id)
    .map((t) => toAbsolute(`/trilhas/${t.slug || t.id}`, 0.6, 'monthly'));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...tagRoutes,
    ...glossarioRoutes,
    ...trilhaRoutes,
  ];
}

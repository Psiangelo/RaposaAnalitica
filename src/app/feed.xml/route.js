import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
import siteContent from '@/data/site-content.json';

export const dynamic = 'force-static';

const BASE = SITE_URL_FROM_LIB;

function escapeXml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Tira a marcação *asterisco* de destaque dos títulos.
 *
 * No site o asterisco vira a palavra em relevo (ver highlightTitle.jsx), mas
 * num leitor de RSS ele aparece cru: «O que é *consciência* em Jung?».
 */
function stripHighlights(s = '') {
  return String(s).replace(/\*([^*]+)\*/g, '$1');
}

function getPublishedPosts() {
  const data = siteContent?.data || {};
  const posts = data['raposa_admin_blog'] || [];
  if (!Array.isArray(posts)) return [];
  return posts
    .filter((p) => p && p.status === 'published')
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
    .slice(0, 30);
}

export function GET() {
  const posts = getPublishedPosts();
  const now = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const slug = p.slug || p.id;
      // Aponta pra rota estática SSG com OG pre-renderizada, não pro SPA
      const link = `${BASE}/blog/${encodeURIComponent(slug)}/`;
      const pub = new Date(p.updated_at || Date.now()).toUTCString();
      const excerpt = p.excerpt || stripHtml(p.content_html).slice(0, 280);
      const ogImage = `${BASE}/og/posts/${slug}.jpg`;
      return `<item>
<title>${escapeXml(stripHighlights(p.title) || 'Sem título')}</title>
<link>${escapeXml(link)}</link>
<guid isPermaLink="true">${escapeXml(link)}</guid>
<pubDate>${pub}</pubDate>
<description>${escapeXml(excerpt)}</description>
<enclosure url="${escapeXml(ogImage)}" type="image/jpeg" />
${(p.tags || []).map((t) => `<category>${escapeXml(t)}</category>`).join('')}
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Raposa Analítica · Ensaios</title>
<link>${BASE}/blog/</link>
<atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
<description>Ensaios sobre a obra de Carl Gustav Jung: conceitos, epistemologia e prática de estudo da psicologia analítica.</description>
<language>pt-BR</language>
<lastBuildDate>${now}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

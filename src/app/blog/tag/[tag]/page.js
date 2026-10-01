import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
import siteContent from '@/data/site-content.json';
import TagClient from './TagClient';

const SITE_URL = SITE_URL_FROM_LIB;

export function slugifyTag(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getPublishedPosts() {
  const posts = siteContent?.data?.raposa_admin_blog;
  if (!Array.isArray(posts)) return [];
  return posts.filter((p) => p && (p.slug || p.id) && (!p.status || p.status === 'published'));
}

function getUniqueTags() {
  const map = new Map(); // slug → original
  for (const p of getPublishedPosts()) {
    for (const t of p.tags || []) {
      const slug = slugifyTag(t);
      if (slug && !map.has(slug)) map.set(slug, t);
    }
  }
  return map;
}

export function generateStaticParams() {
  const tags = Array.from(getUniqueTags().keys());
  if (tags.length === 0) return [{ tag: '__placeholder__' }];
  return tags.map((tag) => ({ tag }));
}

export function generateMetadata({ params }) {
  const tags = getUniqueTags();
  const original = tags.get(params.tag);

  if (!original) {
    return { title: 'Tag — Raposa Analítica', robots: { index: false } };
  }

  const title = `${original} · Ensaios de psicologia analítica`;
  const description = `Publicações marcadas com "${original}" — ensaios de psicologia analítica e prática clínica junguiana.`;
  const url = `${SITE_URL}/blog/tag/${params.tag}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url,
      siteName: 'Raposa Analítica',
      title: `${original} · Raposa Analítica`,
      description,
      images: [
        { url: `${SITE_URL}/og-square.png`, width: 1200, height: 1200, alt: 'Raposa Analítica', type: 'image/png' },
        { url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: 'Raposa Analítica', type: 'image/png' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${original} · Raposa Analítica`,
      description,
      images: [`${SITE_URL}/og.png`],
    },
  };
}

export default function TagPage({ params }) {
  const tags = getUniqueTags();
  const original = tags.get(params.tag);
  const posts = getPublishedPosts()
    .filter((p) => (p.tags || []).some((t) => slugifyTag(t) === params.tag))
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));

  return <TagClient tag={original || params.tag} posts={posts} />;
}

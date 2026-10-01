import { notFound } from 'next/navigation';
import siteContent from '@/data/site-content.json';
import { trilhas as TRILHAS_DEFAULT } from '@/data/trilhas';
const MATERIALS_DEFAULT = [];
import { DEFAULT_AREAS } from '@/lib/areas';
import { migrateTrilhaBlocks } from '@/lib/linkResolver';
import TrilhaDetailClient from './TrilhaDetailClient';

function getList() {
  const stored = siteContent?.data?.raposa_admin_trilhas;
  return Array.isArray(stored) && stored.length > 0 ? stored : TRILHAS_DEFAULT;
}

function bySlug(slug) {
  return getList().find((t) => (t.slug || t.id) === slug);
}

function getInitialAreas() {
  const stored = siteContent?.data?.raposa_admin_areas;
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_AREAS;
}

function getInitialPosts() {
  const stored = siteContent?.data?.raposa_admin_blog;
  return Array.isArray(stored) ? stored : [];
}

function getInitialMaterials() {
  const stored = siteContent?.data?.raposa_admin_materials;
  return Array.isArray(stored) && stored.length > 0 ? stored : MATERIALS_DEFAULT;
}

export function generateStaticParams() {
  return getList().map((t) => ({ trilha: t.slug || t.id }));
}

export function generateMetadata({ params }) {
  const t = bySlug(params.trilha);
  if (!t) return {};
  const og = {
    title: `${t.name} · Trilhas · Raposa Analítica`,
    description: t.subtitle || `Trilha de estudo: ${t.name}`,
    type: 'article',
  };
  if (t.coverImage) og.images = [{ url: t.coverImage, alt: t.name }];
  return {
    title: `${t.name} · Estudos`,
    description: t.subtitle || `Trilha de estudo: ${t.name}`,
    openGraph: og,
  };
}

export default function TrilhaDetailPage({ params }) {
  const raw = bySlug(params.trilha);
  if (!raw) return notFound();
  const trilha = migrateTrilhaBlocks(raw);
  const allTrilhas = getList().map(migrateTrilhaBlocks);
  return (
    <TrilhaDetailClient
      initialTrilha={trilha}
      initialAreas={getInitialAreas()}
      initialPosts={getInitialPosts()}
      initialMaterials={getInitialMaterials()}
      initialAllTrilhas={allTrilhas}
    />
  );
}

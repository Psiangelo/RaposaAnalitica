import siteContent from '@/data/site-content.json';
import { glossario as GLOSSARIO_DEFAULT, CATEGORIES as CATEGORIES_DEFAULT } from '@/data/glossario';
import GlossarioClient from './GlossarioClient';

export const metadata = {
  title: 'Glossário junguiano',
  description:
    'Termos essenciais da psicologia analítica — Self, Sombra, Individuação, Arquétipo, Sincronicidade e mais. Definições claras, com links entre conceitos.',
  openGraph: {
    title: 'Verbetes · Raposa Analítica',
    description: 'Termos essenciais da psicologia analítica, interligados.',
    type: 'article',
  },
};

function getInitial() {
  const list = siteContent?.data?.raposa_admin_glossario;
  const cats = siteContent?.data?.raposa_admin_glossario_categories;
  return {
    list: Array.isArray(list) && list.length > 0
      ? list
      : GLOSSARIO_DEFAULT.map((g, i) => ({ ...g, links: [], hidden: false, ordem: i })),
    categories: Array.isArray(cats) && cats.length > 0
      ? cats
      : Object.entries(CATEGORIES_DEFAULT).map(([slug, info], i) => ({ slug, label: info.label, tone: info.tone, ordem: i })),
  };
}

export default function GlossarioPage() {
  const { list, categories } = getInitial();
  return <GlossarioClient initialList={list} initialCategories={categories} />;
}

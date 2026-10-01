import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
import BlogClient from './BlogClient';
import siteContent from '@/data/site-content.json';

const SITE_URL = SITE_URL_FROM_LIB;

function getInitialPosts() {
  const posts = siteContent?.data?.raposa_admin_blog;
  return Array.isArray(posts) ? posts : [];
}

function getInitialSeries() {
  const series = siteContent?.data?.raposa_admin_blog_series;
  return Array.isArray(series) ? series : [];
}

export const metadata = {
  title: 'Blog · Ensaios de psicologia analítica',
  description:
    'Ensaios sobre psicologia analítica, clínica junguiana, prática de estudo, mitologia e individuação. Publicações atualizadas quando há algo a dizer.',
  alternates: { canonical: `${SITE_URL}/blog/` },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${SITE_URL}/blog/`,
    siteName: 'Raposa Analítica',
    title: 'Blog · Ensaios de psicologia analítica · Raposa Analítica',
    description:
      'Ensaios sobre psicologia analítica, clínica junguiana, mitologia e individuação.',
    images: [
      { url: `${SITE_URL}/og-square.png`, width: 1200, height: 1200, alt: 'Raposa Analítica', type: 'image/png' },
      { url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: 'Raposa Analítica', type: 'image/png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog · Ensaios de psicologia analítica · Raposa Analítica',
    description: 'Ensaios sobre psicologia analítica e prática clínica junguiana.',
    images: [`${SITE_URL}/og.png`],
  },
};

export default function Page() {
  return <BlogClient initialPosts={getInitialPosts()} initialSeriesList={getInitialSeries()} />;
}

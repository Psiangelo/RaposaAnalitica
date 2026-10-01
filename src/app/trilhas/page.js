import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
import siteContent from '@/data/site-content.json';
import { trilhas as TRILHAS_DEFAULT } from '@/data/trilhas';
import { DEFAULT_AREAS } from '@/lib/areas';
import EstudosListingClient from './EstudosListingClient';

const SITE_URL = SITE_URL_FROM_LIB;

export const metadata = {
  title: 'Estudos · Guias de leitura em psicologia analítica',
  description:
    'Guias de estudo em psicologia analítica junguiana — por onde começar, em que ordem ler, com vídeos, materiais, cartografia e ensaios em cada etapa.',
  alternates: { canonical: `${SITE_URL}/trilhas/` },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${SITE_URL}/trilhas/`,
    siteName: 'Raposa Analítica',
    title: 'Trilhas · Raposa Analítica',
    description: 'Guias de estudo em psicologia analítica junguiana.',
  },
};

function getInitialTrilhas() {
  const stored = siteContent?.data?.raposa_admin_trilhas;
  return Array.isArray(stored) && stored.length > 0 ? stored : TRILHAS_DEFAULT;
}

function getInitialAreas() {
  const stored = siteContent?.data?.raposa_admin_areas;
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_AREAS;
}

export default function EstudosPage() {
  return (
    <EstudosListingClient
      initialTrilhas={getInitialTrilhas()}
      initialAreas={getInitialAreas()}
    />
  );
}

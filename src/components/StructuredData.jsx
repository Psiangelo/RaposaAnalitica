import { SITE_URL, SITE_NAME } from '@/lib/site';
import siteContentSnapshot from '@/data/site-content.json';

// Lê o snapshot publicado direto (sitedata.js é 'use client' e não pode ser
// chamado num Server Component; ver o histórico no Psiangelo).
const DEFAULT_AUTHOR = {
  name: 'Ângelo',
  credential: 'Estudante de psicologia · leitor de Jung',
  bio: 'Leio Jung faz um tempo, e aqui eu conto o que vou achando.',
  photo: { src: '/raposa/fig/perfil-raposa-oculos.webp', alt: 'A Raposa Analítica' },
};

function getPublishedAuthor() {
  const stored = siteContentSnapshot?.data?.raposa_admin_bio?.author;
  if (!stored || typeof stored !== 'object') return DEFAULT_AUTHOR;
  return { ...DEFAULT_AUTHOR, ...stored, photo: { ...DEFAULT_AUTHOR.photo, ...(stored.photo || {}) } };
}

export default function StructuredData() {
  const author = getPublishedAuthor();
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}#marca`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/raposa/fig/perfil-raposa-oculos.webp`,
        founder: { '@id': `${SITE_URL}#person` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}#person`,
        name: author.name,
        jobTitle: author.credential,
        description: author.bio,
        url: `${SITE_URL}/sobre`,
        knowsAbout: ['Psicologia Analítica', 'Carl Gustav Jung', 'Obra Completa de Jung', 'Arquétipos', 'Individuação', 'Sombra', 'Anima e animus'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'Ensaios, verbetes e trilhas de leitura sobre a obra de Carl Gustav Jung, com a referência de cada coisa.',
        publisher: { '@id': `${SITE_URL}#marca` },
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'Blog',
        '@id': `${SITE_URL}#blog`,
        url: `${SITE_URL}/blog`,
        name: `Ensaios · ${SITE_NAME}`,
        description: 'Ensaios sobre a obra de Jung: uma pergunta de cada vez, com a fonte.',
        author: { '@id': `${SITE_URL}#person` },
        publisher: { '@id': `${SITE_URL}#marca` },
        isPartOf: { '@id': `${SITE_URL}#website` },
        inLanguage: 'pt-BR',
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

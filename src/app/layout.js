import './globals.css';
import { Fraunces, Literata, Barlow, Barlow_Semi_Condensed } from 'next/font/google';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTop from '@/components/BackToTop';
import SkipLink from '@/components/SkipLink';
import ContentBootstrap from '@/components/ContentBootstrap';
import StructuredData from '@/components/StructuredData';
import CommandPalette from '@/components/CommandPalette';
import Analytics from '@/components/Analytics';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// As três fontes da marca (as mesmas do feed): Fraunces nos títulos, com o
// arredondado (SOFT) e o itálico torto (WONK) ligados; Literata na prosa,
// que venceu o teste de leitura no celular; Barlow na interface.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});
const literata = Literata({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-literata',
  display: 'swap',
});
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const barlowCond = Barlow_Semi_Condensed({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-barlow-cond',
  display: 'swap',
});

const DESCRICAO =
  'Ensaios, verbetes e trilhas de leitura sobre a obra de Carl Gustav Jung, com a referência de cada coisa. Sou uma raposa e guio você pela floresta da psicologia analítica.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Ensaios, verbetes e trilhas sobre Jung`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRICAO,
  keywords: [
    'psicologia analítica', 'Carl Gustav Jung', 'Jung', 'obra completa de Jung', 'verbetes junguianos',
    'arquétipos', 'sombra', 'anima', 'individuação', 'inconsciente coletivo', 'pesquisa em Jung',
    'TCC sobre Jung', 'Raposa Analítica',
  ],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Ensaios, verbetes e trilhas sobre Jung`,
    description: DESCRICAO,
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: SITE_NAME, type: 'image/png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DESCRICAO,
    images: [`${SITE_URL}/og.png`],
  },
  // Em construção: o Google só entra quando o Gabriel decidir onde mora o
  // blog de Jung (conteúdo duplicado com o Psiangelo). Trocar para
  // { index: true, follow: true } na abertura.
  robots: { index: false, follow: false },
  manifest: `${SITE_URL}/manifest.json`,
  appleWebApp: { capable: true, statusBarStyle: 'default', title: SITE_NAME },
};

export const viewport = {
  themeColor: '#F2EBDC',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${literata.variable} ${barlow.variable} ${barlowCond.variable}`}
    >
      <head>
        <Analytics />
      </head>
      <body>
        <SkipLink />
        <StructuredData />
        <ContentBootstrap />
        <CommandPalette />
        {children}
        <WhatsAppButton />
        <BackToTop />
      </body>
    </html>
  );
}

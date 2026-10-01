import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Links',
  description: 'Os caminhos da Raposa Analítica: ensaios, trilha para começar, verbetes, pesquisa sob encomenda e as Cartas da Raposa.',
  alternates: { canonical: `${SITE_URL}/bio/` },
};

export default function BioLayout({ children }) {
  return children;
}

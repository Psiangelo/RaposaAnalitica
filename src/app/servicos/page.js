import ServicosClient from './ServicosClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Pesquisa sob encomenda na obra de Jung',
  description:
    'Para quem escreve TCC, dissertação, tese ou artigo com Jung: localização na Obra Completa, dossiê temático, «Jung disse mesmo?» e conferência das suas citações, com obra e parágrafo.',
  alternates: { canonical: `${SITE_URL}/servicos/` },
};

export default function Page() {
  return <ServicosClient />;
}

import ServicosClient from './ServicosClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Pesquisa sob encomenda na obra de Jung',
  description:
    'Para quem escreve TCC, dissertação, tese ou artigo com Jung: uma pesquisa em todos os volumes da Obra Completa sobre o tema que você precisar, em três níveis de entrega, com a obra e o parágrafo de cada coisa. E roteiros sobre Jung para vídeo e post.',
  alternates: { canonical: `${SITE_URL}/servicos/` },
};

export default function Page() {
  return <ServicosClient />;
}

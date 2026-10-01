import LojaClient from './LojaClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Loja · materiais para estudar Jung',
  description:
    'Guias que atravessam a obra de Jung por um conceito, leituras comentadas para ler junto com o livro e outros materiais da Raposa Analítica.',
  alternates: { canonical: `${SITE_URL}/loja/` },
};

export default function Page() {
  return <LojaClient />;
}

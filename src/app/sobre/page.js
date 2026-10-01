import SobreClient from './SobreClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Sobre a raposa',
  description: 'Quem escreve a Raposa Analítica: uma raposa estudante de psicologia lendo a obra de Jung de ponta a ponta, com a referência de cada coisa.',
  alternates: { canonical: `${SITE_URL}/sobre/` },
};

export default function Page() {
  return <SobreClient />;
}

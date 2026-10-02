import SobreClient from './SobreClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Sobre mim',
  description: 'Sigo os rastros de Jung pela obra e conto o que vou achando, com a referência de cada coisa.',
  alternates: { canonical: `${SITE_URL}/sobre/` },
};

export default function Page() {
  return <SobreClient />;
}

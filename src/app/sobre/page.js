import SobreClient from './SobreClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Sobre mim',
  description: 'Estudo psicologia e escrevo sobre Jung, com a referência de cada coisa.',
  alternates: { canonical: `${SITE_URL}/sobre/` },
};

export default function Page() {
  return <SobreClient />;
}

import HomeClient from './HomeClient';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const metadata = {
  title: { absolute: `${SITE_NAME} · Ensaios, verbetes e trilhas sobre a obra de Jung` },
  description:
    'Ensaios, verbetes e trilhas de leitura sobre Carl Gustav Jung, escritos devagar e com a referência de cada coisa. E pesquisa sob encomenda para quem escreve TCC, dissertação ou tese com Jung.',
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Page() {
  return <HomeClient />;
}

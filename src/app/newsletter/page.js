import CartasClient from './CartasClient';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Cartas da Raposa · newsletter',
  description: 'Uma carta quando eu acho alguma coisa na obra de Jung: ensaio novo, verbete novo, trilha nova e um achado das notas de rodapé.',
  alternates: { canonical: `${SITE_URL}/newsletter/` },
};

export default function Page() {
  return <CartasClient />;
}

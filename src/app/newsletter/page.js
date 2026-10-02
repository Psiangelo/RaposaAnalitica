import Redireciona from './Redireciona';

// As Cartas não têm mais página própria (pedido do Gabriel, 01/10/2026): a
// inscrição fica no pé do blog. Quem chegar por um link antigo vai para lá.
export const metadata = { title: 'Cartas da Raposa', robots: { index: false } };

export default function Page() {
  return <Redireciona />;
}

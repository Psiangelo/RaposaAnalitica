import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import LegalPage from '@/components/ui/LegalPage';

export const metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a Raposa Analítica trata dados pessoais: o que é coletado, para quê, com quem é compartilhado e como exercer os seus direitos previstos na LGPD.',
  alternates: { canonical: `${SITE_URL}/privacidade/` },
  robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
  return (
    <LegalPage eyebrow="Documentos" title="Política de Privacidade" updatedAt="1º de outubro de 2026">
      <p>
        A Raposa Analítica é um projeto pessoal de estudo e escrita sobre a obra de Carl Gustav Jung.
        Esta página diz, em linguagem direta, quais dados pessoais passam por aqui, para quê, por
        quanto tempo e o que você pode exigir a respeito deles, conforme a Lei Geral de Proteção de
        Dados (Lei nº 13.709/2018).
      </p>

      <h2>Quem é o responsável</h2>
      <p>
        O responsável pelo tratamento (o “controlador”, na linguagem da LGPD) é Ângelo, pessoa física,
        autor e mantenedor deste site. Para qualquer assunto sobre dados pessoais, inclusive os pedidos
        descritos ao final, o canal é o WhatsApp indicado no rodapé.
      </p>

      <h2>Navegar não coleta nada</h2>
      <p>
        Você pode ler os ensaios, os verbetes e as trilhas sem se identificar. Este site não guarda
        dado pessoal de quem só navega.
      </p>

      <h2>Se você assina as Cartas da Raposa</h2>
      <p>
        Ao se inscrever, o seu endereço vai para o banco de dados das cartas, hospedado na Supabase
        (um serviço de banco de dados na nuvem), numa tabela que só eu acesso; o site em si não lê nem
        mostra essa lista. Também vão juntos o texto do consentimento que você marcou, a data e a
        página onde você se inscreveu, para eu saber o que leva as pessoas a assinar.
      </p>
      <p>
        <strong>Finalidade:</strong> mandar as cartas: avisos do que sai no site e achados da obra
        de Jung. <strong>Base legal:</strong> o seu consentimento (art. 7º, I), dado ao marcar a
        caixa, que nunca vem marcada. <strong>Por quanto tempo:</strong> enquanto você quiser; toda
        carta diz como sair, e quando você pede eu apago o seu endereço da lista.
      </p>
      <p>
        <strong>O que eu não faço:</strong> não vendo, alugo, troco nem repasso o seu e-mail para
        ninguém. Quando houver material novo na loja, as cartas podem avisar, e você continua podendo
        sair a qualquer momento.
      </p>

      <h2>Se você pede uma pesquisa</h2>
      <p>
        O pedido chega pelo WhatsApp ou por e-mail, com o que você escolher mandar: o tema, o tipo de
        trabalho, às vezes um capítulo seu. Isso é usado só para fazer e entregar a pesquisa. Não é
        publicado nem repassado a ninguém.
      </p>
      <p>
        Trechos do material que você enviar podem passar por ferramentas de terceiros que uso no trabalho,
        de busca e de tratamento de texto. Se o seu texto não pode sair do seu computador em hipótese
        nenhuma, avise antes, e combinamos outro jeito.
      </p>

      <h2>Se você compra na loja</h2>
      <p>
        O pagamento acontece na plataforma de cada produto (o botão “Comprar” leva até ela). Os dados
        da compra (nome, e-mail, pagamento) são tratados por essa plataforma, segundo a política dela.
        Eu recebo dela o necessário para entregar o material e atender você.
      </p>

      <h2>Armazenamento no seu navegador</h2>
      <p>
        O site guarda algumas coisas no <code>localStorage</code> do seu navegador, uma área local que
        não é <em>cookie</em>, não acompanha você por outros sites e não é enviada a servidor nenhum:
        uma cópia do conteúdo do site (para carregar rápido), o seu progresso nas trilhas e a
        velocidade da leitura em voz alta. Dá para apagar tudo limpando os dados do site no seu
        navegador. Detalhes na <Link href="/cookies/">Política de Cookies</Link>.
      </p>

      <h2>Serviços de terceiros</h2>
      <ul>
        <li>
          <strong>GitHub Pages</strong> (GitHub, Inc., Estados Unidos) hospeda o site e, como todo
          servidor, registra acessos (inclusive endereço IP) para operação e segurança. Não tenho
          acesso a esses registros.
        </li>
        <li>
          <strong>O serviço das Cartas</strong>, descrito acima, só para quem se inscreve.
        </li>
        <li>
          <strong>WhatsApp</strong> (Meta Platforms), se você clicar em algum botão de conversa. A
          conversa passa a seguir a política do WhatsApp.
        </li>
      </ul>
      <p>
        As fontes do site são servidas daqui mesmo, sem chamar servidores do Google. <strong>Não há
        Google Analytics, pixel de rede social, remarketing nem rastreador publicitário.</strong> Se
        um dia houver medição de audiência, será uma que não usa cookies nem identifica ninguém, e esta
        página muda antes.
      </p>

      <h2>Não me mande informação de saúde</h2>
      <p>
        Aqui é material de estudo, não atendimento: não atendo nem dou diagnóstico por aqui. Por favor,
        não descreva sintomas ou histórico clínico em mensagem pelos canais deste site. Dado de saúde é
        especialmente protegido pela LGPD, e este não é o lugar para ele.
      </p>

      <h2>Os seus direitos</h2>
      <p>A LGPD (art. 18) garante, a qualquer momento e sem custo, o direito de:</p>
      <ul>
        <li>saber se eu trato dados seus e quais são;</li>
        <li>obter uma cópia deles;</li>
        <li>corrigir dado incompleto ou desatualizado;</li>
        <li><strong>revogar o consentimento e ter os dados eliminados</strong>;</li>
        <li>saber com quem os dados foram compartilhados;</li>
        <li>opor-se a um tratamento que considere irregular.</li>
      </ul>
      <p>Para qualquer um deles, basta pedir pelo contato do rodapé. Não precisa justificar.</p>

      <h2>Menores de idade</h2>
      <p>
        O site não é dirigido a crianças e não coleta de propósito dados de menores de 16 anos. Se
        souber que isso aconteceu, avise e os dados são eliminados.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Se esta política mudar, a data no topo muda junto. Mudança que altere o uso do seu e-mail é
        avisada nas cartas antes de valer.
      </p>
    </LegalPage>
  );
}

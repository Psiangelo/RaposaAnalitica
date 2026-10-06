import Link from 'next/link';
import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
import LegalPage from '@/components/ui/LegalPage';

const SITE_URL = SITE_URL_FROM_LIB;

export const metadata = {
  title: 'Política de Cookies',
  description:
    'Este site não usa cookies de rastreamento nem publicidade. O que ele guarda no seu navegador, por que guarda e como apagar.',
  alternates: { canonical: `${SITE_URL}/cookies/` },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Documentos"
      title="Política de Cookies"
      updatedAt="1º de outubro de 2026"
    >
      <p>
        <strong>Resumo: este site não usa cookies de rastreamento, não usa cookies de
        publicidade e não tem banner de consentimento porque não há o que consentir.</strong>{' '}
        Ele guarda algumas informações no seu navegador para funcionar, e é isso que esta página
        explica.
      </p>

      <h2>Por que não existe banner de cookies aqui</h2>
      <p>
        O aviso de cookies é exigido quando um site instala cookies não essenciais, sobretudo os
        de análise de audiência e de publicidade, que acompanham o visitante entre páginas e
        entre sites. Este site não instala nenhum deles. Um banner pedindo permissão para algo
        que não acontece seria teatro, e atrapalharia justamente o que este site oferece, que é
        ler em paz.
      </p>
      <p>
        Se um dia eu adicionar qualquer medição que exija consentimento, o banner aparece junto,
        e não antes.
      </p>

      <h2>O que é guardado no seu navegador</h2>
      <p>
        Não são cookies, tecnicamente. É o <code>localStorage</code>, uma área de armazenamento
        local do navegador. A diferença prática importa: cookies são enviados ao servidor a cada
        requisição, e o <code>localStorage</code> fica no seu dispositivo e não é enviado a
        ninguém.
      </p>

      <h3>Conteúdo do site</h3>
      <p>
        Os textos dos ensaios, os verbetes e as trilhas ficam guardados localmente
        depois da primeira visita. Isso faz a navegação ser instantânea e o site continuar
        legível mesmo com conexão instável. Não há nada seu nesses dados: é o mesmo conteúdo que
        todo visitante recebe.
      </p>

      <h3>Suas preferências</h3>
      <p>
        Coisas como o progresso em uma trilha de estudo. Ficam só no seu dispositivo. Se você
        abrir o site em outro aparelho, elas não vão com você, justamente porque não existe conta
        nem identificação de usuário aqui.
      </p>

      <h3>O painel de quem escreve</h3>
      <p>
        Existe uma área restrita que só eu uso, para escrever e publicar. Ela guarda no navegador de
        quem a usa os rascunhos e uma chave de acesso. Isso não afeta visitantes.
      </p>

      <h2>Terceiros que o seu navegador contata</h2>
      <p>
        As fontes tipográficas são servidas daqui mesmo, sem chamar o Google. O site fica no GitHub
        Pages, que registra acessos como qualquer servidor web faz; não tenho acesso a esses registros.
        Se você usa o formulário das Cartas, o seu navegador envia o e-mail ao serviço de newsletter
        escolhido (veja a Política de Privacidade).
      </p>

      <h2>Como apagar tudo</h2>
      <p>
        Nas configurações do seu navegador, procure por “dados de sites” ou “dados de navegação”
        e limpe os deste endereço. Também funciona navegar em janela privada, que descarta tudo
        ao fechar. A única consequência é perder as preferências locais, como o progresso de uma
        trilha. Nenhum conteúdo fica inacessível.
      </p>

      <p>
        Sobre dados pessoais em geral, e sobre a lista de e-mail, veja a{' '}
        <Link href="/privacidade/">Política de Privacidade</Link>.
      </p>
    </LegalPage>
  );
}

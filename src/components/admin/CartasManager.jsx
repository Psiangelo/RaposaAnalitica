'use client';

import { useEffect, useState } from 'react';
import {
  getNewsletterConfig, setNewsletterConfig, DEFAULT_NEWSLETTER, NEWSLETTER_PROVEDORES,
  getHomepage, setHomepage, DEFAULT_HOMEPAGE,
} from '@/lib/sitedata';
import { CARD, BTN, BTN2, BTN_PERIGO, Campo, Texto, Area, Escolha, Secao, mover } from '@/components/admin/ui';

/**
 * Admin → Cartas da Raposa: para onde vai o e-mail de quem se inscreve, e
 * os textos da página /newsletter e dos formulários.
 */
export default function CartasManager({ addToast, addLogEntry }) {
  const [c, setC] = useState(DEFAULT_NEWSLETTER);
  const [txt, setTxt] = useState(DEFAULT_HOMEPAGE.newsletter);
  const [sujo, setSujo] = useState(false);

  useEffect(() => {
    setC(getNewsletterConfig());
    setTxt({ ...DEFAULT_HOMEPAGE.newsletter, ...(getHomepage().newsletter || {}) });
  }, []);

  const muda = (fn) => {
    setC((a) => fn(structuredClone(a)));
    setSujo(true);
  };
  const mudaTxt = (k, v) => {
    setTxt((a) => ({ ...a, [k]: v }));
    setSujo(true);
  };

  const salvar = () => {
    setNewsletterConfig(c);
    const home = getHomepage();
    setHomepage({ ...home, newsletter: txt });
    setSujo(false);
    addToast?.('Cartas salvas. Lembre de publicar.', 'success');
    addLogEntry?.('Cartas', `provedor: ${c.provedor}`);
  };

  return (
    <div className="max-w-4xl">
      <div className="sticky top-[57px] z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 mb-4 bg-[rgb(var(--fundo-rgb)/0.95)] flex items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">
          A newsletter, a página <b>/newsletter</b> e os formulários. {sujo && <span className="text-[rgb(var(--rubedo-rgb))]">Há alterações não salvas.</span>}
        </p>
        <button onClick={salvar} className={BTN} disabled={!sujo}>Salvar</button>
      </div>

      <Secao
        titulo="Para onde vão os e-mails"
        descricao="O site não guarda e-mail nenhum: quem se inscreve vai direto para o serviço escolhido, que manda as cartas e cuida do descadastro. Enquanto nenhum for escolhido, o formulário avisa que as cartas começam em breve e oferece o aviso pelo WhatsApp."
      >
        <div className={`${CARD} grid gap-4`}>
          <Campo label="Nome da newsletter"><Texto value={c.nome} onChange={(v) => muda((x) => ((x.nome = v), x))} /></Campo>
          <Campo label="Serviço"><Escolha value={c.provedor} onChange={(v) => muda((x) => ((x.provedor = v), x))} opcoes={NEWSLETTER_PROVEDORES} /></Campo>
          {c.provedor === 'buttondown' && (
            <Campo label="Usuário no Buttondown" dica="O nome que aparece em buttondown.com/SEU-USUARIO. Grátis até 100 inscritos.">
              <Texto value={c.buttondownUsuario} onChange={(v) => muda((x) => ((x.buttondownUsuario = v.trim()), x))} placeholder="raposaanalitica" />
            </Campo>
          )}
          {c.provedor === 'substack' && (
            <Campo label="Endereço do Substack" dica="O formulário abre a página de inscrição do Substack com o e-mail já preenchido.">
              <Texto value={c.substackEndereco} onChange={(v) => muda((x) => ((x.substackEndereco = v.trim()), x))} placeholder="raposaanalitica.substack.com" />
            </Campo>
          )}
          {c.provedor === 'formulario' && (
            <>
              <Campo label="Endereço (action) do formulário" dica="MailerLite, Kit, Brevo ou Google Forms dão esse endereço no código de «formulário incorporado» (o que vem em action=…).">
                <Texto value={c.formularioAcao} onChange={(v) => muda((x) => ((x.formularioAcao = v.trim()), x))} placeholder="https://…" />
              </Campo>
              <Campo label="Nome do campo de e-mail" dica="O name= do campo de e-mail nesse formulário (MailerLite: fields[email]; Google Forms: entry.123456).">
                <Texto value={c.formularioCampoEmail} onChange={(v) => muda((x) => ((x.formularioCampoEmail = v.trim()), x))} />
              </Campo>
            </>
          )}
        </div>
      </Secao>

      <Secao titulo="Textos do formulário" descricao="Aparecem na home, no fim de cada ensaio e na página das cartas.">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Rótulo"><Texto value={txt.eyebrow} onChange={(v) => mudaTxt('eyebrow', v)} /></Campo>
          <Campo label="Botão"><Texto value={txt.buttonLabel} onChange={(v) => mudaTxt('buttonLabel', v)} /></Campo>
          <Campo label="Título (começo)"><Texto value={txt.title} onChange={(v) => mudaTxt('title', v)} /></Campo>
          <Campo label="Título (fim, em vermelho)"><Texto value={txt.emphasis} onChange={(v) => mudaTxt('emphasis', v)} /></Campo>
          <Campo label="Texto" className="sm:col-span-2"><Area value={txt.lead} onChange={(v) => mudaTxt('lead', v)} rows={2} /></Campo>
          <Campo label="Mensagem de sucesso"><Texto value={txt.successMessage} onChange={(v) => mudaTxt('successMessage', v)} /></Campo>
          <Campo label="Mensagem de erro"><Texto value={txt.errorMessage} onChange={(v) => mudaTxt('errorMessage', v)} /></Campo>
        </div>
      </Secao>

      <Secao
        titulo="A página /newsletter"
        acoes={<button className={BTN2} onClick={() => muda((x) => (x.pagina.itens.push({ titulo: 'Novo item', texto: '' }), x))}>+ item</button>}
      >
        <div className={`${CARD} grid sm:grid-cols-2 gap-4 mb-3`}>
          <Campo label="Rótulo"><Texto value={c.pagina.eyebrow} onChange={(v) => muda((x) => ((x.pagina.eyebrow = v), x))} /></Campo>
          <Campo label="Título (começo)"><Texto value={c.pagina.title} onChange={(v) => muda((x) => ((x.pagina.title = v), x))} /></Campo>
          <Campo label="Título (palavra em vermelho)"><Texto value={c.pagina.emphasis} onChange={(v) => muda((x) => ((x.pagina.emphasis = v), x))} /></Campo>
          <Campo label="Texto de abertura" className="sm:col-span-2"><Area value={c.pagina.lead} onChange={(v) => muda((x) => ((x.pagina.lead = v), x))} rows={3} /></Campo>
        </div>
        <div className="space-y-3">
          {c.pagina.itens.map((it, i) => (
            <div key={i} className={`${CARD} grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-start`}>
              <Texto value={it.titulo} onChange={(v) => muda((x) => ((x.pagina.itens[i].titulo = v), x))} />
              <Area value={it.texto} onChange={(v) => muda((x) => ((x.pagina.itens[i].texto = v), x))} rows={2} />
              <div className="flex gap-1.5">
                <button className={BTN2} onClick={() => muda((x) => ((x.pagina.itens = mover(x.pagina.itens, i, -1)), x))}>↑</button>
                <button className={BTN_PERIGO} onClick={() => muda((x) => (x.pagina.itens.splice(i, 1), x))}>×</button>
              </div>
            </div>
          ))}
        </div>
      </Secao>
    </div>
  );
}

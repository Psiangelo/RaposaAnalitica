'use client';

import { useEffect, useState } from 'react';
import {
  getNewsletterConfig, setNewsletterConfig, DEFAULT_NEWSLETTER, NEWSLETTER_PROVEDORES,
  getHomepage, setHomepage, DEFAULT_HOMEPAGE,
} from '@/lib/sitedata';
import { CARD, BTN, Campo, Texto, Area, Escolha, Secao } from '@/components/admin/ui';

/** Tira do link pré-preenchido do Formulário do Google o endereço de envio e os campos. */
function lerLinkGoogle(link) {
  try {
    const u = new URL(String(link).trim());
    const m = u.pathname.match(/\/forms\/d\/e\/([^/]+)\//);
    if (!m) return null;
    let campoEmail = '';
    let campoAceite = '';
    let valorAceite = '';
    for (const [k, v] of u.searchParams) {
      if (!k.startsWith('entry.')) continue;
      if (v.includes('@')) campoEmail = k;
      else if (!campoAceite) {
        campoAceite = k;
        valorAceite = v;
      }
    }
    return { acao: `https://docs.google.com/forms/d/e/${m[1]}/formResponse`, campoEmail, campoAceite, valorAceite };
  } catch {
    return null;
  }
}

/**
 * Admin → Cartas da Raposa: para onde vai o e-mail de quem se inscreve e os
 * textos da caixa de inscrição (não há mais página própria das cartas).
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
          A caixa de inscrição das Cartas: no pé do blog, no fim de cada ensaio e na home. {sujo && <span className="text-[rgb(var(--rubedo-rgb))]">Há alterações não salvas.</span>}
        </p>
        <button onClick={salvar} className={BTN} disabled={!sujo}>Salvar</button>
      </div>

      <Secao
        titulo="Para onde vão os e-mails"
        descricao="O site não guarda e-mail nenhum: quem se inscreve vai direto para o destino escolhido. Enquanto nenhum estiver configurado, a caixa avisa que as cartas começam em breve e oferece o aviso pelo WhatsApp."
      >
        <div className={`${CARD} grid gap-4`}>
          <Campo label="Nome da newsletter"><Texto value={c.nome} onChange={(v) => muda((x) => ((x.nome = v), x))} /></Campo>
          <Campo label="Serviço"><Escolha value={c.provedor} onChange={(v) => muda((x) => ((x.provedor = v), x))} opcoes={NEWSLETTER_PROVEDORES} /></Campo>
          {c.provedor === 'google' && (
            <>
              <Campo
                label="Link pré-preenchido do Formulário do Google"
                dica="No formulário: menu ⋮ → «Obter link pré-preenchido» → escreva teste@exemplo.com no e-mail, marque a caixinha → «Obter link» → copie e cole aqui. O painel tira daí os campos."
              >
                <Texto
                  value=""
                  onChange={(v) => {
                    const r = lerLinkGoogle(v);
                    if (r) muda((x) => ((x.googleAcao = r.acao), (x.googleCampoEmail = r.campoEmail), (x.googleCampoAceite = r.campoAceite), (x.googleValorAceite = r.valorAceite), x));
                  }}
                  placeholder="https://docs.google.com/forms/d/e/…/viewform?usp=pp_url&entry.…"
                />
              </Campo>
              <div className="grid sm:grid-cols-2 gap-3">
                <Campo label="Endereço de envio (formResponse)"><Texto value={c.googleAcao} onChange={(v) => muda((x) => ((x.googleAcao = v.trim()), x))} /></Campo>
                <Campo label="Campo do e-mail"><Texto value={c.googleCampoEmail} onChange={(v) => muda((x) => ((x.googleCampoEmail = v.trim()), x))} placeholder="entry.123456" /></Campo>
                <Campo label="Campo da caixinha «quero receber»"><Texto value={c.googleCampoAceite} onChange={(v) => muda((x) => ((x.googleCampoAceite = v.trim()), x))} placeholder="entry.654321" /></Campo>
                <Campo label="Texto da opção marcada" dica="Igual ao da opção no formulário."><Texto value={c.googleValorAceite} onChange={(v) => muda((x) => ((x.googleValorAceite = v), x))} /></Campo>
                <Campo label="Campo da página de origem (opcional)" dica="Se o formulário tiver uma pergunta para isso, ela recebe «blog», «ensaio» ou «home»."><Texto value={c.googleCampoOrigem} onChange={(v) => muda((x) => ((x.googleCampoOrigem = v.trim()), x))} /></Campo>
              </div>
              {c.googleAcao && c.googleCampoEmail
                ? <p className="font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))]">Pronto: a caixa grava no formulário. Salve e publique.</p>
                : <p className="font-sans text-[13px] text-[rgb(var(--rubedo-rgb))]">Falta o endereço de envio e o campo do e-mail.</p>}
            </>
          )}
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

      <Secao titulo="Textos da caixa" descricao="Aparecem no pé do blog, no fim de cada ensaio e na home.">
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

    </div>
  );
}

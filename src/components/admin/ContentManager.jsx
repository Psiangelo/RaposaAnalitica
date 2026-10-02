'use client';

import { useEffect, useState } from 'react';
import { getHomepage, setHomepage, DEFAULT_HOMEPAGE } from '@/lib/sitedata';
import { CARD, BTN, BTN2, BTN_PERIGO, Campo, Texto, Area, Secao, mover } from '@/components/admin/ui';

/**
 * Admin → Textos da home: a abertura (a floresta), «quem escreve» (que
 * também abastece /sobre) e o «converse comigo». Os textos das Cartas ficam
 * na aba Cartas; os de Pesquisa e Loja, nas abas deles.
 */
export default function ContentManager({ addToast, addLogEntry }) {
  const [h, setH] = useState(DEFAULT_HOMEPAGE);
  const [sujo, setSujo] = useState(false);

  useEffect(() => {
    setH(getHomepage());
  }, []);

  const muda = (sec, k, v) => {
    setH((x) => ({ ...x, [sec]: { ...x[sec], [k]: v } }));
    setSujo(true);
  };
  const lista = (sec, k, fn) => {
    setH((x) => ({ ...x, [sec]: { ...x[sec], [k]: fn([...(x[sec]?.[k] || [])]) } }));
    setSujo(true);
  };

  const salvar = () => {
    setHomepage(h);
    setSujo(false);
    addToast?.('Textos salvos. Lembre de publicar.', 'success');
    addLogEntry?.('Textos da home', 'salvos');
  };

  const hero = h.hero || {};
  const about = h.about || {};
  const c = h.contact || {};

  return (
    <div className="max-w-4xl">
      <div className="sticky top-[57px] z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 mb-4 bg-[rgb(var(--fundo-rgb)/0.95)] flex items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">
          Para destacar uma palavra em vermelho nos títulos, use os campos «palavra em vermelho». {sujo && <span className="text-[rgb(var(--rubedo-rgb))]">Há alterações não salvas.</span>}
        </p>
        <button onClick={salvar} className={BTN} disabled={!sujo}>Salvar</button>
      </div>

      <Secao titulo="Abertura (a floresta)" descricao="O topo da página inicial.">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Rótulo" className="sm:col-span-2"><Texto value={hero.eyebrow} onChange={(v) => muda('hero', 'eyebrow', v)} /></Campo>
          <Campo label="Título (começo)"><Texto value={hero.titlePrefix} onChange={(v) => muda('hero', 'titlePrefix', v)} /></Campo>
          <Campo label="Título (palavra em vermelho)"><Texto value={hero.titleEmphasis} onChange={(v) => muda('hero', 'titleEmphasis', v)} /></Campo>
          <Campo label="Linha em itálico" className="sm:col-span-2"><Texto value={hero.tagline} onChange={(v) => muda('hero', 'tagline', v)} /></Campo>
          <Campo label="Texto" className="sm:col-span-2"><Area value={hero.lead} onChange={(v) => muda('hero', 'lead', v)} rows={3} /></Campo>
          <Campo label="Botão principal"><Texto value={hero.primaryLabel} onChange={(v) => muda('hero', 'primaryLabel', v)} /></Campo>
          <Campo label="Leva para"><Texto value={hero.primaryHref} onChange={(v) => muda('hero', 'primaryHref', v)} placeholder="/blog" /></Campo>
          <Campo label="Botão secundário"><Texto value={hero.secondaryLabel} onChange={(v) => muda('hero', 'secondaryLabel', v)} /></Campo>
          <Campo label="Leva para"><Texto value={hero.secondaryHref} onChange={(v) => muda('hero', 'secondaryHref', v)} placeholder="/trilhas" /></Campo>
          <Campo label="Citação no pergaminho" className="sm:col-span-2" dica="Deixe em branco para tirar o pergaminho.">
            <Area value={hero.quote} onChange={(v) => muda('hero', 'quote', v)} rows={3} />
          </Campo>
          <Campo label="Referência da citação (selo vermelho)"><Texto value={hero.quoteSource} onChange={(v) => muda('hero', 'quoteSource', v)} placeholder="OC 13 §241" /></Campo>
        </div>
      </Secao>

      <Secao titulo="Quem escreve" descricao="Aparece na home e na página /sobre. Nome, credencial e a frase de aviso ficam em «Bio e autor».">
        <div className={`${CARD} grid gap-4`}>
          <Campo label="Rótulo da seção"><Texto value={about.title} onChange={(v) => muda('about', 'title', v)} /></Campo>
          <Campo label="Primeiro parágrafo (vai também no topo de /sobre)"><Area value={about.paragraph1} onChange={(v) => muda('about', 'paragraph1', v)} rows={3} /></Campo>
          <Campo label="Segundo parágrafo"><Area value={about.paragraph2} onChange={(v) => muda('about', 'paragraph2', v)} rows={3} /></Campo>
          <Campo label="Terceiro parágrafo (só em /sobre)"><Area value={about.paragraph3} onChange={(v) => muda('about', 'paragraph3', v)} rows={3} /></Campo>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="font-serif text-[1.1rem] text-[rgb(var(--texto-forte-rgb))]">Gostos (os ladrilhos de /sobre)</p>
          <button className={BTN2} onClick={() => lista('about', 'gostos', (l) => [...l, { titulo: 'Novo gosto', detalhe: '' }])}>+ gosto</button>
        </div>
        <p className="font-sans text-[12.5px] text-[rgb(var(--texto-dim-rgb))] mb-2">Mitologia, Xadrez, Anime, Escrever e Doce já têm figura. Outros ganham a pegada da raposa.</p>
        <div className="space-y-2">
          {(about.gostos || []).map((g, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
              <Texto value={g.titulo} onChange={(v) => lista('about', 'gostos', (l) => ((l[i] = { ...l[i], titulo: v }), l))} />
              <Texto value={g.detalhe} onChange={(v) => lista('about', 'gostos', (l) => ((l[i] = { ...l[i], detalhe: v }), l))} />
              <div className="flex gap-1">
                <button className={BTN2} onClick={() => lista('about', 'gostos', (l) => mover(l, i, -1))}>↑</button>
                <button className={BTN_PERIGO} onClick={() => lista('about', 'gostos', (l) => (l.splice(i, 1), l))}>×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="font-serif text-[1.1rem] text-[rgb(var(--texto-forte-rgb))]">Percurso (a lista de /sobre)</p>
          <button className={BTN2} onClick={() => lista('about', 'credentials', (l) => [...l, { mark: '◆', label: 'Novo', detail: '' }])}>+ item</button>
        </div>
        <div className="space-y-2 mt-2">
          {(about.credentials || []).map((cr, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
              <Texto value={cr.label} onChange={(v) => lista('about', 'credentials', (l) => ((l[i] = { ...l[i], label: v }), l))} />
              <Texto value={cr.detail} onChange={(v) => lista('about', 'credentials', (l) => ((l[i] = { ...l[i], detail: v }), l))} />
              <div className="flex gap-1">
                <button className={BTN2} onClick={() => lista('about', 'credentials', (l) => mover(l, i, -1))}>↑</button>
                <button className={BTN_PERIGO} onClick={() => lista('about', 'credentials', (l) => (l.splice(i, 1), l))}>×</button>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Converse comigo" descricao="O shoji no fim da home e de /sobre.">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Rótulo"><Texto value={c.sectionLabel} onChange={(v) => muda('contact', 'sectionLabel', v)} /></Campo>
          <Campo label="Título" dica="Se terminar em «shoji», a palavra fica em vermelho."><Texto value={c.title} onChange={(v) => muda('contact', 'title', v)} /></Campo>
          <Campo label="Texto" className="sm:col-span-2"><Area value={c.lead} onChange={(v) => muda('contact', 'lead', v)} rows={2} /></Campo>
          <Campo label="Rótulo do canal"><Texto value={c.primaryLabel} onChange={(v) => muda('contact', 'primaryLabel', v)} /></Campo>
          <Campo label="Botão"><Texto value={c.primaryButton} onChange={(v) => muda('contact', 'primaryButton', v)} /></Campo>
          <Campo label="Canal (começo)"><Texto value={c.primaryHeadingPrefix} onChange={(v) => muda('contact', 'primaryHeadingPrefix', v)} /></Campo>
          <Campo label="Canal (palavra em vermelho)"><Texto value={c.primaryHeadingEmphasis} onChange={(v) => muda('contact', 'primaryHeadingEmphasis', v)} /></Campo>
          <Campo label="Texto do canal" className="sm:col-span-2"><Area value={c.primaryText} onChange={(v) => muda('contact', 'primaryText', v)} rows={2} /></Campo>
          <Campo label="WhatsApp (só números)"><Texto value={c.whatsappNumber} onChange={(v) => muda('contact', 'whatsappNumber', v)} /></Campo>
          <Campo label="E-mail (opcional)"><Texto value={c.emailValue} onChange={(v) => muda('contact', 'emailValue', v)} /></Campo>
          <Campo label="Instagram (como aparece)"><Texto value={c.instagramValue} onChange={(v) => muda('contact', 'instagramValue', v)} placeholder="@raposanalitica" /></Campo>
          <Campo label="Instagram (link)"><Texto value={c.instagramUrl} onChange={(v) => muda('contact', 'instagramUrl', v)} /></Campo>
        </div>
      </Secao>
    </div>
  );
}

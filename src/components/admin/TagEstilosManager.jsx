'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBlogPosts, getTagEstilos, setTagEstilos } from '@/lib/sitedata';
import { WAGARA, estiloDaTag, wagaraStyle } from '@/lib/wagara';
import { CARD, BTN, BTN2, Secao } from '@/components/admin/ui';

const CORES = [
  { cor: '#2E5240', nome: 'Cedro' }, { cor: '#1E3A2F', nome: 'Mata funda' }, { cor: '#5C7D4E', nome: 'Musgo' },
  { cor: '#962B24', nome: 'Urushi' }, { cor: '#CF432F', nome: 'Torii' }, { cor: '#2E4C7A', nome: 'Anil' },
  { cor: '#6B4A35', nome: 'Tronco' }, { cor: '#7A4A2E', nome: 'Castanha' }, { cor: '#9C3D5C', nome: 'Ume' },
  { cor: '#7A64AE', nome: 'Glicínia' }, { cor: '#1B2B33', nome: 'Noite' }, { cor: '#9A7552', nome: 'Chá' },
];

/**
 * Admin → Estilo das tags: a cor e a padronagem de cada tag do blog. Vira o
 * selo da tag nos cards e a capa de reserva dos ensaios sem imagem.
 */
export default function TagEstilosManager({ addToast }) {
  const [mapa, setMapa] = useState({});
  const [tags, setTags] = useState([]);
  const [sujo, setSujo] = useState(false);

  useEffect(() => {
    setMapa(getTagEstilos());
    const t = new Set();
    getBlogPosts().forEach((p) => (p.tags || []).forEach((x) => t.add(x)));
    setTags(Array.from(t).sort((a, b) => a.localeCompare(b, 'pt')));
  }, []);

  const muda = (tag, campo, valor) => {
    const k = tag.toLowerCase();
    setMapa((m) => ({ ...m, [k]: { ...estiloDaTag(tag, m), [campo]: valor } }));
    setSujo(true);
  };

  const salvar = () => {
    setTagEstilos(mapa);
    setSujo(false);
    addToast?.('Estilos das tags salvos. Lembre de publicar.', 'success');
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Sem escolha, cada tag ganha cor e padronagem fixas pelo nome.</p>
        <button onClick={salvar} className={BTN} disabled={!sujo}>Salvar</button>
      </div>
      <Secao titulo={`Tags dos ensaios (${tags.length})`}>
        {tags.length === 0 && <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Nenhum ensaio tem tag ainda.</p>}
        <div className="space-y-3">
          {tags.map((tag) => {
            const e = estiloDaTag(tag, mapa);
            return (
              <div key={tag} className={`${CARD} grid sm:grid-cols-[160px_1fr] gap-4 items-start`}>
                <div className="relative h-24 rounded-xl overflow-hidden" style={{ background: e.cor }}>
                  <div className="absolute inset-0" style={wagaraStyle(e.padrao, '#F2EBDC', 0.22, 30, 1.5)} />
                  <span className="absolute left-2 bottom-2 rounded-full bg-[var(--washi)] px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--tinta)]">{tag}</span>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {CORES.map((c) => (
                      <button
                        key={c.cor}
                        type="button"
                        title={c.nome}
                        onClick={() => muda(tag, 'cor', c.cor)}
                        className={`w-7 h-7 rounded-full border-2 ${e.cor === c.cor ? 'border-[var(--torii)] scale-110' : 'border-transparent'}`}
                        style={{ background: c.cor }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {WAGARA.map((w) => (
                      <button key={w.id} type="button" title={w.sentido} onClick={() => muda(tag, 'padrao', w.id)} className={`${BTN2} ${e.padrao === w.id ? '!bg-[var(--mata)] !text-[var(--washi)] !border-[var(--mata)]' : ''}`}>
                        {w.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Secao>
    </div>
  );
}

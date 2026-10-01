'use client';

import { useMemo, useState } from 'react';
import FIGURAS from '@/data/figuras.json';
import Figura from '@/components/raposa/Figura';

const GRUPOS = [
  { id: 'fig', nome: 'Raposas e bichos' },
  { id: 'mascara', nome: 'Máscaras' },
  { id: 'obj', nome: 'Objetos' },
  { id: 'mata', nome: 'A mata' },
  { id: 'kamon', nome: 'Brasões (kamon)' },
  { id: 'arvore', nome: 'Árvores' },
];

/**
 * Escolher uma figura do banco da Raposa (public/raposa/). Mostra as
 * figuras do grupo em grade; um clique escolhe.
 */
export default function FiguraPicker({ value, onChange, grupos = ['fig', 'mascara', 'obj', 'mata', 'kamon'] }) {
  const [grupo, setGrupo] = useState(() => (value ? value.split('/')[0] : grupos[0]));
  const [aberto, setAberto] = useState(false);
  const nomes = useMemo(() => Object.keys(FIGURAS).filter((k) => k.startsWith(`${grupo}/`) && !k.endsWith('-claro')), [grupo]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="w-16 h-16 rounded-xl bg-[var(--nevoa)] flex items-center justify-center overflow-hidden shrink-0">
          {value ? <Figura nome={value} alt="" className="max-w-[86%] max-h-[86%] w-auto" /> : <span className="text-[11px] text-[rgb(var(--texto-dim-rgb))]">nenhuma</span>}
        </span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAberto((a) => !a)} className="px-3 py-1.5 rounded-full border border-[rgb(var(--linha-rgb))] text-[13px] font-sans">
            {aberto ? 'Fechar' : 'Escolher figura'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="px-3 py-1.5 rounded-full text-[13px] font-sans text-[rgb(var(--texto-dim-rgb))]">
              tirar
            </button>
          )}
        </div>
      </div>
      {aberto && (
        <div className="mt-3 rounded-xl border border-[rgb(var(--linha-rgb))] bg-[rgb(var(--fundo-rgb))] p-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {GRUPOS.filter((g) => grupos.includes(g.id)).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGrupo(g.id)}
                className={`px-3 py-1 rounded-full text-[12.5px] font-sans ${grupo === g.id ? 'bg-[var(--mata)] text-[var(--washi)]' : 'bg-[rgb(var(--cartao-rgb))] text-[rgb(var(--texto-rgb))]'}`}
              >
                {g.nome}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-72 overflow-y-auto">
            {nomes.map((n) => (
              <button
                key={n}
                type="button"
                title={n}
                onClick={() => {
                  onChange(n);
                  setAberto(false);
                }}
                className={`aspect-square rounded-lg flex items-center justify-center p-1.5 bg-[var(--nevoa)] border-2 ${value === n ? 'border-[var(--torii)]' : 'border-transparent hover:border-[rgb(var(--linha-rgb))]'}`}
              >
                <Figura nome={n} alt="" className="max-w-full max-h-full w-auto" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { listarInscritos, apagarInscrito } from '@/lib/publicarNuvem';
import { CARD, BTN, BTN2, BTN_PERIGO } from '@/components/admin/ui';

const ORIGEM = { blog: 'pé do blog', ensaio: 'fim de um ensaio', home: 'página inicial', loja: 'loja', bio: 'bio' };

function csv(linhas) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const cab = ['email', 'quando', 'onde', 'pagina', 'consentimento'];
  const corpo = linhas.map((l) => [l.email, new Date(l.criado_em).toLocaleString('pt-BR'), ORIGEM[l.origem] || l.origem, l.pagina, l.consentimento].map(esc).join(','));
  return [cab.join(','), ...corpo].join('\n');
}

/** Quem se inscreveu nas Cartas: ver, baixar a lista e apagar quem pedir para sair. */
export default function InscritosManager({ addToast, addLogEntry }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = async () => {
    setErro('');
    try {
      setLista(await listarInscritos());
    } catch (e) {
      setErro(e.message);
      setLista([]);
    }
  };
  useEffect(() => {
    carregar();
  }, []);

  const baixar = () => {
    const blob = new Blob(['﻿' + csv(lista || [])], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cartas-inscritos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const apagar = async (l) => {
    if (!confirm(`Apagar ${l.email} da lista? (use quando a pessoa pedir para sair)`)) return;
    try {
      await apagarInscrito(l.id);
      setLista((x) => x.filter((i) => i.id !== l.id));
      addToast?.('Apagado da lista.', 'success');
      addLogEntry?.('Inscrito apagado', l.email);
    } catch (e) {
      addToast?.(`Não deu para apagar: ${e.message}`, 'error');
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <p className="font-serif text-[1.6rem] leading-none text-[rgb(var(--texto-forte-rgb))]">{lista ? lista.length : '…'}</p>
          <p className="mt-1 font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))]">pessoa(s) inscrita(s) nas Cartas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className={BTN2}>Atualizar</button>
          <button onClick={baixar} disabled={!lista?.length} className={BTN}>Baixar a lista (planilha)</button>
        </div>
      </div>

      {erro && <p className="font-sans text-[14px] text-[rgb(var(--rubedo-rgb))]">Não deu para ler a lista: {erro}</p>}

      {lista && lista.length === 0 && !erro && (
        <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Ninguém se inscreveu ainda.</p>
      )}

      {lista && lista.length > 0 && (
        <ul className="space-y-2">
          {lista.map((l) => (
            <li key={l.id} className={`${CARD} flex flex-wrap items-center justify-between gap-3 py-3`}>
              <div className="min-w-0">
                <p className="font-sans text-[15px] font-semibold text-[rgb(var(--texto-forte-rgb))] break-all">{l.email}</p>
                <p className="font-sans text-[12.5px] text-[rgb(var(--texto-dim-rgb))]">
                  {new Date(l.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · {ORIGEM[l.origem] || l.origem || 'site'}
                </p>
              </div>
              <button onClick={() => apagar(l)} className={BTN_PERIGO}>Apagar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

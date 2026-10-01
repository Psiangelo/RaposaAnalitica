'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getGlossario } from '@/lib/sitedata';

/**
 * GlossaryTermPopover — escolhe a qual verbete o trecho selecionado aponta.
 *
 * O autolink acerta o óbvio (a grafia do termo ou de um alias). Este popover
 * cobre o resto: marcar «aquele núcleo afetivo» como complexo, ou decidir que
 * neste parágrafo «a imagem» quer dizer arquétipo. Quem sabe isso é quem
 * escreveu.
 *
 * Grava só o slug no conteúdo; título e definição são lidos do glossário no
 * build, então reescrever um verbete atualiza todos os posts sozinho.
 */
export default function GlossaryTermPopover({ selectedText, currentSlug, onSubmit, onRemove, onClose }) {
  const [busca, setBusca] = useState('');
  const inputRef = useRef(null);
  const lista = useMemo(() => getGlossario(), []);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const visiveis = (lista || []).filter((t) => t && t.slug && !t.hidden);
    if (!q) return visiveis.slice(0, 40);
    return visiveis
      .filter((t) => {
        const alvos = [t.term, t.slug, ...(t.aliases || [])].map((s) => String(s || '').toLowerCase());
        return alvos.some((a) => a.includes(q));
      })
      .slice(0, 40);
  }, [busca, lista]);

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-[320px] bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.25)] rounded-xl shadow-xl shadow-black/50 overflow-hidden">
      <div className="px-3 pt-3 pb-2 border-b border-[rgb(var(--acento-rgb)/0.12)]">
        <p className="text-[0.62rem] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2">
          Apontar para um verbete
        </p>
        {selectedText ? (
          <p className="text-xs text-[rgb(var(--texto-rgb))] font-sans mb-2 truncate">
            Trecho: <span className="text-[rgb(var(--texto-forte-rgb))]">“{selectedText}”</span>
          </p>
        ) : (
          <p className="text-xs text-yellow-200/70 font-sans mb-2">
            Selecione um trecho do texto primeiro.
          </p>
        )}
        <input
          ref={inputRef}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar verbete…"
          className="w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.2)] focus:border-[rgb(var(--acento-rgb))] rounded-lg px-3 py-2 text-sm text-[rgb(var(--texto-forte-rgb))] outline-none font-sans"
        />
      </div>

      <ul className="max-h-[260px] overflow-y-auto">
        {filtrados.length === 0 && (
          <li className="px-3 py-4 text-xs text-[rgb(var(--texto-dim-rgb))] font-sans">Nenhum verbete encontrado.</li>
        )}
        {filtrados.map((t) => (
          <li key={t.slug}>
            <button
              type="button"
              disabled={!selectedText}
              onClick={() => onSubmit?.(t.slug)}
              className={`w-full text-left px-3 py-2 hover:bg-[rgb(var(--cartao-hover-rgb))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                currentSlug === t.slug ? 'bg-[rgb(var(--cartao-hover-rgb))]' : ''
              }`}
            >
              <span className="block text-sm text-[rgb(var(--texto-forte-rgb))] font-sans">
                {t.term}
                {currentSlug === t.slug && <span className="text-[rgb(var(--acento-rgb))] text-xs"> · atual</span>}
              </span>
              {t.short && (
                <span className="block text-[0.7rem] text-[rgb(var(--texto-dim-rgb))] font-sans leading-snug line-clamp-2">
                  {t.short}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[rgb(var(--acento-rgb)/0.12)]">
        {currentSlug ? (
          <button
            type="button"
            onClick={() => onRemove?.()}
            className="text-[0.7rem] text-[rgb(var(--texto-dim-rgb))] hover:text-red-300 font-sans transition-colors"
          >
            remover marcação
          </button>
        ) : (
          <span className="text-[0.66rem] text-[rgb(var(--texto-dim-rgb))] font-sans">
            O autolink já cobre os termos óbvios
          </span>
        )}
        <button
          type="button"
          onClick={() => onClose?.()}
          className="text-[0.7rem] text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-forte-rgb))] font-sans transition-colors"
        >
          fechar
        </button>
      </div>
    </div>
  );
}

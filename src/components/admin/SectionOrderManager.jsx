'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HOME_SECTION_META,
  DEFAULT_HOME_SECTIONS,
  getHomeSections,
  setHomeSections,
  getSiteVisibility,
} from '@/lib/sitedata';

const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-4 sm:p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
const BTN_ICON = 'w-8 h-8 flex items-center justify-center border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] rounded-md hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

export default function SectionOrderManager({ addToast, addLogEntry }) {
  const [order, setOrder] = useState(DEFAULT_HOME_SECTIONS);
  const [visibility, setVisibility] = useState({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setOrder(getHomeSections());
    setVisibility(getSiteVisibility());
  }, []);

  const metaById = Object.fromEntries(HOME_SECTION_META.map((m) => [m.id, m]));

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    // Hero fixo no topo — não troca com o index 0 se for hero
    if (metaById[next[idx]]?.fixed || metaById[next[target]]?.fixed) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrder(next);
    setDirty(true);
  };

  const persist = () => {
    setHomeSections(order);
    setDirty(false);
    addLogEntry?.('Ordem das seções salva', order.join(' › '));
    addToast?.('Ordem salva', 'success');
  };

  const resetAll = () => {
    if (!confirm('Restaurar ordem padrão das seções?')) return;
    setOrder(DEFAULT_HOME_SECTIONS);
    setDirty(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Ordem das seções da home</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">
            Use as setas para reorganizar. A visibilidade continua sendo controlada em “Visibilidade”.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className={BTN_SECONDARY}>Restaurar padrão</button>
          <button
            onClick={persist}
            disabled={!dirty}
            className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}
          >
            Salvar ordem
          </button>
        </div>
      </div>

      <div className={CARD}>
        <ol className="space-y-1.5">
          {order.map((id, i) => {
            const meta = metaById[id];
            if (!meta) return null;
            const visible = meta.visKey ? visibility[meta.visKey] !== false : true;
            const isHero = meta.fixed;
            return (
              <li
                key={id}
                className={`flex items-center gap-3 p-2 pr-3 rounded-lg border transition-colors ${
                  isHero
                    ? 'border-[rgb(var(--acento-rgb)/0.2)] bg-[rgb(var(--fundo-rgb)/0.6)]'
                    : 'border-[rgb(var(--acento-rgb)/0.08)] hover:border-[rgb(var(--acento-rgb)/0.2)]'
                }`}
              >
                <span className="w-7 text-center font-mono text-[10px] text-[rgb(var(--texto-dim-rgb))] tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-sans ${visible ? 'text-[rgb(var(--texto-forte-rgb))]' : 'text-[rgb(var(--texto-dim-rgb))] line-through'}`}>
                    {meta.label}
                  </p>
                  <p className="text-[10px] font-mono text-[rgb(var(--texto-dim-rgb))]">
                    {id}
                    {isHero && <span className="ml-2 text-[rgb(var(--acento-rgb))]">fixo</span>}
                    {!visible && <span className="ml-2 text-[#8A5A3A]">oculto</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={isHero || i === 0 || metaById[order[i - 1]]?.fixed}
                    className={BTN_ICON}
                    title="Mover para cima"
                    aria-label={`Mover ${meta.label} para cima`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={isHero || i === order.length - 1}
                    className={BTN_ICON}
                    title="Mover para baixo"
                    aria-label={`Mover ${meta.label} para baixo`}
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {dirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-16 sm:bottom-4 z-40 bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] rounded-lg shadow-lg shadow-black/40 flex items-center justify-between gap-3 px-4 py-3"
        >
          <span className="text-xs sm:text-sm font-sans font-semibold">
            Você tem mudanças não salvas
          </span>
          <button
            onClick={persist}
            className="px-4 py-1.5 bg-[rgb(var(--fundo-rgb))] text-[rgb(var(--acento-rgb))] text-xs font-sans font-semibold rounded tracking-wider uppercase"
          >
            Salvar agora
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

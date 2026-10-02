'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DEFAULT_LABELS,
  DEFAULT_NAV_LABELS,
  DEFAULT_SECTION_LABELS,
  getLabels,
  setLabels,
} from '@/lib/sitedata';

const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-4 sm:p-5';
const INPUT = 'w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-sm font-sans rounded-lg px-3 py-2 transition-colors';
const LABEL = 'block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-1.5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';

// Lista de campos por seção pra ordenar e dar contexto na UI
const NAV_FIELDS = [
  { key: 'home',       label: 'Início',   hint: 'Usado no menu do celular' },
  { key: 'blog',       label: 'Ensaios',  hint: 'Link de /blog' },
  { key: 'glossario',  label: 'Verbetes', hint: 'Link de /verbetes' },
  { key: 'estudos',    label: 'Trilhas',  hint: 'Link de /trilhas' },
  { key: 'servicos',   label: 'Pesquisa', hint: 'Link de /servicos' },
  { key: 'loja',       label: 'Loja',     hint: 'Link de /loja' },
  { key: 'about',      label: 'Sobre',    hint: 'Link de /sobre' },
  { key: 'newsletter', label: 'Cartas',   hint: 'O botão verde do menu (newsletter)' },
];

// Títulos das seções da home. Use *asteriscos* em volta do pivô em vermelho:
// «Da *clareira*».
const SECTION_FIELDS = [
  { key: 'blog',     label: 'Últimos ensaios', hint: 'Padrão: Da *clareira*' },
  { key: 'verbetes', label: 'Verbetes',        hint: 'Padrão: As máscaras *da floresta*' },
  { key: 'estudos',  label: 'Trilhas',         hint: 'Padrão: O caminho dos *mil torii*' },
  { key: 'about',    label: 'Quem sou eu',    hint: 'Padrão: Sou estudante *de psicologia*' },
];

function Field({ value, onChange, fallback, label, hint }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fallback || 'usar default'}
        className={INPUT}
      />
      {hint && <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] italic mt-1">{hint}</p>}
    </div>
  );
}

export default function LabelsManager({ addToast, addLogEntry }) {
  const [data, setData] = useState(DEFAULT_LABELS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setData(getLabels());
  }, []);

  const updateNav = (k, v) => {
    setData((prev) => ({ ...prev, nav: { ...prev.nav, [k]: v } }));
    setDirty(true);
  };
  const updateSection = (k, v) => {
    setData((prev) => ({ ...prev, sections: { ...prev.sections, [k]: v } }));
    setDirty(true);
  };

  const persist = () => {
    setLabels(data);
    setDirty(false);
    addLogEntry?.('Labels salvos');
    addToast?.('Labels salvos', 'success');
  };

  const resetAll = () => {
    if (!confirm('Restaurar nomes padrão (apaga todas as customizações)?')) return;
    setData(DEFAULT_LABELS);
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
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Nomes (labels)</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1 max-w-2xl">
            Renomeie links da barra de navegação e títulos das seções da home.
            Deixar em branco usa o nome padrão do site.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={resetAll} className={BTN_SECONDARY}>
            Restaurar padrão
          </button>
          <button
            onClick={persist}
            disabled={!dirty}
            className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}
          >
            Salvar
          </button>
        </div>
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

      <div className={CARD}>
        <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest mb-1">
          Barra de navegação
        </h3>
        <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] mb-4">
          Cada campo renomeia o link correspondente na navbar (desktop e mobile).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAV_FIELDS.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              hint={f.hint}
              fallback={DEFAULT_NAV_LABELS[f.key]}
              value={data.nav?.[f.key] ?? ''}
              onChange={(v) => updateNav(f.key, v)}
            />
          ))}
        </div>
      </div>

      <div className={CARD}>
        <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest mb-1">
          Títulos das seções da home
        </h3>
        <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] mb-4">
          Substitui o título principal de cada seção da página inicial. Em
          branco, o site mostra o título padrão (com itálicos no destaque).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTION_FIELDS.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              hint={f.hint}
              fallback={DEFAULT_SECTION_LABELS[f.key] || ''}
              value={data.sections?.[f.key] ?? ''}
              onChange={(v) => updateSection(f.key, v)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

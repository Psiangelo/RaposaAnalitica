'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BASE_PATH } from '@/lib/site';
import { DEFAULT_VISIBILITY, getSiteVisibility, setSiteVisibility } from '@/lib/sitedata';

const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-4 sm:p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';

// Agrupamento dos toggles pra UI ficar organizada
const GROUPS = [
  {
    label: 'Páginas',
    hint: 'Quando desligada, a página some do menu e da home, e o endereço mostra um aviso.',
    items: [
      { key: 'home',       label: 'Início',                          url: '/' },
      { key: 'blog',       label: 'Ensaios',                         url: '/blog/' },
      { key: 'glossario',  label: 'Verbetes',                        url: '/verbetes/' },
      { key: 'estudos',    label: 'Trilhas',                         url: '/trilhas/' },
      { key: 'servicos',   label: 'Pesquisa sob encomenda',          url: '/servicos/' },
      { key: 'loja',       label: 'Loja',                            url: '/loja/' },
      { key: 'newsletter', label: 'Cartas da Raposa (a caixa de inscrição)', url: '/blog/#cartas' },
      { key: 'bio',        label: 'Bio (link do Instagram)',         url: '/bio/' },
    ],
  },
  {
    label: 'Seções da página inicial',
    hint: 'A ordem fica em «Ordem da home».',
    items: [
      { key: 'ensaioDestaque', label: 'Ensaio em destaque (o mais novo, grande)' },
      { key: 'verbetesHome',   label: 'Verbetes (a fileira de máscaras)' },
      { key: 'servicosHome',   label: 'Pesquisa sob encomenda (faixa da noite)' },
      { key: 'lojaHome',       label: 'Loja (vitrine)' },
      { key: 'about',          label: 'Quem escreve' },
      { key: 'contato',        label: 'Converse comigo (o shoji)' },
      { key: 'cartografia',    label: 'Cartografia de conceitos (dormindo)' },
    ],
  },
  {
    label: 'Ensaios',
    hint: 'O que aparece no fim de cada ensaio e das listas.',
    items: [
      { key: 'blogAuthorBox',  label: 'Caixa de autor no fim de cada ensaio' },
      { key: 'autor',          label: 'Faixa «quem escreve» no fim dos ensaios e das trilhas' },
      { key: 'autorInstagram', label: 'Botão do Instagram nos blocos de autor (o link vem de Configurações)' },
    ],
  },
  {
    label: 'Extras',
    items: [
      { key: 'whatsappFlutuante', label: 'Botão flutuante do WhatsApp' },
    ],
  },
];

function Toggle({ checked, onChange, label, url, onVisit }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[rgb(var(--acento-rgb)/0.06)] last:border-b-0">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? 'Ocultar' : 'Mostrar'} ${label}`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--acento-rgb))] ${
          checked ? 'bg-[rgb(var(--acento-rgb))]' : 'bg-[rgb(var(--acento-rgb)/0.15)]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-[rgb(var(--fundo-rgb))] transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex-1 min-w-0 text-left"
      >
        <p className={`text-sm font-sans ${checked ? 'text-[rgb(var(--texto-forte-rgb))]' : 'text-[rgb(var(--texto-dim-rgb))]'} transition-colors`}>
          {label}
        </p>
        {url && (
          <span className="text-[10px] font-mono text-[rgb(var(--texto-dim-rgb))] tracking-wider">
            {url}
          </span>
        )}
      </button>

      {url && (
        <button
          type="button"
          onClick={onVisit}
          className="text-[10px] font-mono tracking-[0.15em] uppercase text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors whitespace-nowrap px-2 py-1"
        >
          abrir →
        </button>
      )}
    </div>
  );
}

export default function VisibilityManager({ addToast, addLogEntry }) {
  const [data, setData] = useState(DEFAULT_VISIBILITY);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setData(getSiteVisibility());
  }, []);

  const toggle = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const persist = () => {
    setSiteVisibility(data);
    setDirty(false);
    const hiddenList = Object.entries(data).filter(([, v]) => !v).map(([k]) => k);
    addLogEntry?.('Visibilidade salva', hiddenList.length ? `${hiddenList.length} ocultos` : 'tudo visível');
    addToast?.('Visibilidade salva', 'success');
  };

  const resetAll = () => {
    if (!confirm('Restaurar visibilidade padrão (tudo visível)?')) return;
    setData(DEFAULT_VISIBILITY);
    setDirty(true);
  };

  const hideAllIn = (keys) => {
    setData((prev) => ({
      ...prev,
      ...Object.fromEntries(keys.map((k) => [k, false])),
    }));
    setDirty(true);
  };

  const showAllIn = (keys) => {
    setData((prev) => ({
      ...prev,
      ...Object.fromEntries(keys.map((k) => [k, true])),
    }));
    setDirty(true);
  };

  const hiddenCount = Object.values(data).filter((v) => !v).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Visibilidade do site</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">
            Oculta módulos e seções sem apagar nada.{' '}
            {hiddenCount > 0 && (
              <span className="text-[rgb(var(--acento-rgb))]">
                {hiddenCount} {hiddenCount === 1 ? 'item oculto' : 'itens ocultos'}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={resetAll} className={BTN_SECONDARY}>
            Mostrar tudo
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

      {GROUPS.map((group) => {
        const keys = group.items.map((i) => i.key);
        const allOn = keys.every((k) => data[k]);
        const allOff = keys.every((k) => !data[k]);
        return (
          <div key={group.label} className={CARD}>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div>
                <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest">
                  {group.label}
                </h3>
                {group.hint && (
                  <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] mt-1">{group.hint}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => hideAllIn(keys)}
                  disabled={allOff}
                  className={BTN_SECONDARY + (allOff ? ' opacity-30 cursor-not-allowed' : '')}
                >
                  ocultar tudo
                </button>
                <button
                  onClick={() => showAllIn(keys)}
                  disabled={allOn}
                  className={BTN_SECONDARY + (allOn ? ' opacity-30 cursor-not-allowed' : '')}
                >
                  mostrar tudo
                </button>
              </div>
            </div>

            <div className="divide-y divide-[rgb(var(--acento-rgb)/0.06)]">
              {group.items.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  url={item.url}
                  checked={!!data[item.key]}
                  onChange={(v) => toggle(item.key, v)}
                  onVisit={item.url ? () => window.open(`${BASE_PATH}${item.url}`, '_blank') : null}
                />
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

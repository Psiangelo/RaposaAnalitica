'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVisibility } from '@/lib/useVisibility';
import { useSitedata } from '@/lib/useSitedata';
import {
  getGlossario, getTrilhas, getPublishedBlogPosts, getLoja, getServicos,
  SITEDATA_KEYS, DEFAULT_LOJA, DEFAULT_SERVICOS,
} from '@/lib/sitedata';
import { stripHighlights } from '@/lib/highlightTitle';
import Icone from '@/components/raposa/Icone';

/**
 * Busca do site (Ctrl+K, ou o botão de lupa do menu, que dispara o evento
 * `raposa:busca`). Procura no conteúdo publicado: ensaios, verbetes,
 * trilhas, serviços e produtos.
 */

const PAGINAS = [
  { title: 'Início', href: '/', hint: 'Página inicial', vis: 'home' },
  { title: 'Ensaios', href: '/blog', hint: 'Todos os textos', vis: 'blog' },
  { title: 'Verbetes', href: '/verbetes', hint: 'Os conceitos de Jung', vis: 'glossario' },
  { title: 'Trilhas', href: '/trilhas', hint: 'Por onde começar', vis: 'estudos' },
  { title: 'Pesquisa sob encomenda', href: '/servicos', hint: 'Para TCC, dissertação e tese', vis: 'servicos' },
  { title: 'Loja', href: '/loja', hint: 'Guias e materiais', vis: 'loja' },
  { title: 'Cartas da Raposa', href: '/newsletter', hint: 'Newsletter', vis: 'newsletter' },
  { title: 'Sobre', href: '/sobre', hint: 'Quem escreve', vis: null },
  { title: 'Converse comigo', href: '/sobre#converse', hint: 'WhatsApp, Instagram, e-mail', vis: null },
  { title: 'Bio', href: '/bio', hint: 'Os links da raposa', vis: 'bio' },
];

const TIPO = {
  page: { rotulo: 'Página', icone: 'caminho' },
  blog: { rotulo: 'Ensaio', icone: 'pincel' },
  verbete: { rotulo: 'Verbete', icone: 'mascara' },
  trilha: { rotulo: 'Trilha', icone: 'torii' },
  servico: { rotulo: 'Pesquisa', icone: 'lupa' },
  produto: { rotulo: 'Loja', icone: 'sacola' },
};

function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function searchIndex(idx, query) {
  const q = normalize(query).trim();
  if (!q) return idx.filter((i) => i.type !== 'page').slice(0, 8);
  const tokens = q.split(/\s+/).filter(Boolean);
  return idx
    .map((item) => {
      let score = 0;
      for (const t of tokens) {
        if (item.haystack.includes(t)) score += 1;
        if (normalize(item.title).startsWith(t)) score += 3;
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((r) => r.item);
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const router = useRouter();
  const { visibility: v } = useVisibility();

  const glossario = useSitedata(getGlossario, [], SITEDATA_KEYS.glossario);
  const trilhas = useSitedata(getTrilhas, [], SITEDATA_KEYS.trilhas);
  const posts = useSitedata(getPublishedBlogPosts, [], SITEDATA_KEYS.blog);
  const loja = useSitedata(getLoja, DEFAULT_LOJA, SITEDATA_KEYS.loja);
  const servicos = useSitedata(getServicos, DEFAULT_SERVICOS, SITEDATA_KEYS.servicos);

  const index = useMemo(() => {
    const idx = [];
    const add = (type, title, hint, href, extra = '') =>
      idx.push({ type, title, hint, href, haystack: normalize(`${title} ${hint} ${extra}`) });
    for (const p of PAGINAS) if (!p.vis || v[p.vis] !== false) add('page', p.title, p.hint, p.href);
    if (v.blog !== false) for (const p of posts) add('blog', stripHighlights(p.title || ''), p.excerpt || '', `/blog/${p.slug || p.id}`, (p.tags || []).join(' '));
    if (v.glossario !== false) for (const g of glossario) if (!g.hidden) add('verbete', g.term, g.short, `/verbetes/${g.slug}`, (g.aliases || []).join(' '));
    if (v.estudos !== false) for (const t of trilhas) if (!t.hidden) add('trilha', t.name, t.subtitle || t.level || '', `/trilhas/${t.slug || t.id}`);
    if (v.servicos !== false) for (const s of servicos.pecas || []) add('servico', s.nome, s.pergunta, `/servicos#${s.id}`, s.descricao);
    if (v.loja !== false) for (const p of loja.produtos || []) if (p.status !== 'rascunho') add('produto', p.titulo, p.subtitulo || '', `/loja#${p.id}`, p.descricao);
    return idx;
  }, [v, posts, glossario, trilhas, servicos, loja]);

  const results = useMemo(() => searchIndex(index, query), [index, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    };
    const onAbrir = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('raposa:busca', onAbrir);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('raposa:busca', onAbrir);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[active];
      if (item) {
        close();
        router.push(item.href);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[700] bg-[rgb(19_33_31/0.55)] backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed top-[9vh] left-1/2 -translate-x-1/2 z-[701] w-[calc(100vw-32px)] max-w-[620px] bg-bg-card rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgb(19_33_31/0.55)] border border-linha"
            role="dialog"
            aria-label="Buscar no site"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-linha">
              <Icone nome="busca" size={20} className="text-accent" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Procurar na floresta…"
                className="flex-1 bg-transparent font-serif italic text-[1.2rem] text-text-bright placeholder:text-text-faint focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex font-sans text-[11px] font-semibold tracking-[0.12em] text-text-dim px-2 py-1 rounded border border-linha">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-[56vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-10 text-center text-text-dim font-serif italic">
                  A raposa procurou e não achou nada com esse nome.
                </div>
              ) : (
                <ul>
                  {results.map((item, i) => (
                    <li key={`${item.type}-${item.href}-${i}`} data-idx={i}>
                      <Link
                        href={item.href}
                        onClick={close}
                        onMouseEnter={() => setActive(i)}
                        className={`flex items-center gap-3.5 px-5 py-3 transition-colors ${active === i ? 'bg-nevoa' : ''}`}
                      >
                        <span className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${active === i ? 'bg-mata text-[var(--washi)]' : 'bg-bg-warm text-accent'}`}>
                          <Icone nome={TIPO[item.type]?.icone} size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2.5">
                            <span className="font-serif text-[1.02rem] font-semibold text-text-bright truncate">{item.title}</span>
                            <span className="font-sans text-[10.5px] font-semibold tracking-[0.12em] uppercase text-text-dim shrink-0">{TIPO[item.type]?.rotulo}</span>
                          </span>
                          {item.hint && <span className="block text-[0.86rem] text-text-dim line-clamp-1">{item.hint}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-2.5 border-t border-linha bg-bg-warm/60 font-sans text-[11px] tracking-[0.12em] uppercase text-text-dim">
              <span>↑↓ navegar · ↵ abrir</span>
              <span>{results.length} achados</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

/**
 * CartographyView — renderiza UMA cartografia (por slug ou objeto direto).
 * Substitui o antigo Cartography.jsx fixo. Pode ser embutida em qualquer página.
 *
 * Suporta:
 *  - source: 'manual' | 'blog' | 'glossario' (auto-geração via cartographyGenerators)
 *  - layout: 'manual' | 'force' (d3-force calcula posições no client)
 *  - clique em nó: abre drawer com axiom + richContent (se houver) + link
 *
 * Props:
 *  - slug?: string                     — lê via getCartographyBySlug
 *  - cartography?: object              — alternativa: passa objeto pronto
 *  - compact?: boolean                 — visual reduzido (sem section header)
 *  - className?: string                — wrapper opcional
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide,
} from 'd3-force';
import { useSitedata } from '@/lib/useSitedata';
import {
  getCartographies, getCartographyBySlug, getGlossario,
  SITEDATA_KEYS,
} from '@/lib/sitedata';
import { resolveCartographyData } from '@/lib/cartographyGenerators';

const TONE_FILL = {
  accent: '#2E5240',
  bright: '#13211F',
  citrinit: '#962B24',
  rubedo: '#962B24',
};

function getPosts() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('raposa_admin_blog') || '[]'); } catch { return []; }
}

/* ───────────────────── Node ───────────────────── */
function Node({ node, hovered, onHover, onLeave, onClick }) {
  const fill = TONE_FILL[node.tone] || '#2E5240';
  const isActive = hovered === node.id;
  const isClickable = !!node.href || !!node.richContent || !!node.axiom;
  const size = node.size || 16;
  return (
    <g
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      onClick={() => onClick(node)}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <circle cx={node.x} cy={node.y} r={size + 8} fill={fill} opacity={isActive ? 0.18 : 0.06} style={{ transition: 'opacity 250ms' }} />
      <circle cx={node.x} cy={node.y} r={size} fill={fill} opacity={isActive ? 0.95 : 0.55} stroke={fill} strokeWidth={isActive ? 2 : 1} style={{ transition: 'opacity 250ms, stroke-width 250ms' }} />
      <text
        x={node.x}
        y={node.y + size + 14}
        textAnchor="middle"
        fontFamily="var(--f-serif)"
        fontSize={Math.max(10, Math.min(14, size * 0.7))}
        fill={isActive ? '#13211F' : '#2C3A35'}
        style={{ transition: 'fill 250ms' }}
      >
        {node.label}
      </text>
    </g>
  );
}

/* ───────────────────── Drawer ───────────────────── */
function CartographyDrawer({ node, onClose, allNodes, edges }) {
  if (typeof window === 'undefined' && !node) return null;

  const connected = node
    ? edges
        .filter((e) => e[0] === node.id || e[1] === node.id)
        .map((e) => (e[0] === node.id ? e[1] : e[0]))
        .map((id) => allNodes.find((n) => n.id === id))
        .filter(Boolean)
    : [];

  // ESC fecha
  useEffect(() => {
    if (!node) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [node, onClose]);

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-[80]" />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-[81] w-full sm:w-[440px] bg-bg-card border-l border-accent/30 overflow-y-auto"
          >
            <div className="p-6">
              <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-text-dim hover:text-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>

              <p className="font-mono text-[0.6rem] text-accent tracking-[0.25em] uppercase mb-2">
                Conceito
              </p>
              <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-text-bright leading-tight mb-3">
                {node.label}
              </h2>
              {node.axiom && (
                <p className="font-serif italic text-accent-soft text-[1.05rem] leading-snug mb-5">
                  {node.axiom}
                </p>
              )}

              {node.richContent && (
                <div className="prose-glossario mb-6">
                  {String(node.richContent).split(/\n\n+/).filter(Boolean).map((p, i) => (
                    <p key={i} className="font-serif text-[1rem] text-text leading-[1.75] mb-4">{p}</p>
                  ))}
                </div>
              )}

              {node.href && (
                <div className="mb-6">
                  {node.href.startsWith('http') ? (
                    <a href={node.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 font-sans text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-bg bg-accent hover:bg-text-bright transition-colors">
                      Abrir →
                    </a>
                  ) : (
                    <Link href={node.href} className="inline-flex items-center gap-2 px-4 py-2.5 font-sans text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-bg bg-accent hover:bg-text-bright transition-colors">
                      Acessar →
                    </Link>
                  )}
                </div>
              )}

              {connected.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <p className="font-mono text-[0.6rem] text-accent tracking-[0.25em] uppercase mb-3">
                    Conectado a
                  </p>
                  <ul className="space-y-1.5">
                    {connected.map((c) => (
                      <li key={c.id} className="font-serif text-text text-[0.95rem]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent/60 mr-2 align-middle" />
                        {c.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────── Layout helpers ───────────────────── */
function runForceLayout(nodes, edges, viewBox) {
  if (!nodes.length) return nodes;
  const w = viewBox?.w || 800;
  const h = viewBox?.h || 520;
  // Cópia mutável que o d3-force vai modificar in-place
  const sim = nodes.map((n) => ({ ...n, x: n.x ?? w / 2, y: n.y ?? h / 2 }));
  const links = edges
    .map(([a, b, weight]) => ({ source: a, target: b, weight: weight || 1 }))
    .filter((l) => sim.find((n) => n.id === l.source) && sim.find((n) => n.id === l.target));

  const simulation = forceSimulation(sim)
    .force('link', forceLink(links).id((d) => d.id).distance((l) => 120 / Math.max(1, l.weight)).strength(0.6))
    .force('charge', forceManyBody().strength(-220))
    .force('center', forceCenter(w / 2, h / 2))
    .force('collide', forceCollide((d) => (d.size || 16) + 8))
    .stop();

  // Rodadas suficientes pra estabilizar (300 ticks é razoável para grafos pequenos)
  for (let i = 0; i < 300; i++) simulation.tick();
  return sim.map((n) => ({ ...n, x: Math.max(40, Math.min(w - 40, n.x)), y: Math.max(40, Math.min(h - 40, n.y)) }));
}

/* ───────────────────── CartographyView ───────────────────── */
export default function CartographyView({ slug, cartography: cartoProp, compact = false, className = '' }) {
  const allCartographies = useSitedata(getCartographies, [], SITEDATA_KEYS.cartographies);
  const glossario        = useSitedata(getGlossario,     [], SITEDATA_KEYS.glossario);
  const [posts, setPosts] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setPosts(getPosts());
    const reload = () => setPosts(getPosts());
    window.addEventListener('storage', reload);
    return () => window.removeEventListener('storage', reload);
  }, []);

  const cartography = useMemo(() => {
    if (cartoProp) return cartoProp;
    if (slug) return allCartographies.find((c) => c.slug === slug) || null;
    return allCartographies[0] || null;
  }, [cartoProp, slug, allCartographies]);

  // nodes/edges efetivos (resolve source) + layout (calcula posições se force)
  const { nodes, edges } = useMemo(() => {
    if (!cartography) return { nodes: [], edges: [] };
    const data = resolveCartographyData(cartography, { posts, glossario });
    if (cartography.layout === 'force') {
      return { nodes: runForceLayout(data.nodes, data.edges, cartography.viewBox), edges: data.edges };
    }
    return data;
  }, [cartography, posts, glossario]);

  if (!cartography) {
    return compact ? null : (
      <div className={`text-center py-12 ${className}`}>
        <p className="font-serif italic text-text-dim">Cartografia "{slug}" não encontrada.</p>
      </div>
    );
  }

  const viewBox = cartography.viewBox || { w: 800, h: 520 };
  const hoveredNode = hovered ? nodes.find((n) => n.id === hovered) : null;

  return (
    <div className={`relative ${className}`}>
      {!compact && (cartography.title || cartography.description) && (
        <div className="mb-8">
          {cartography.title && (
            <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] text-text-bright leading-tight mb-4">
              {cartography.title}
              {cartography.titleEmphasis && <em className="italic text-accent"> {cartography.titleEmphasis}</em>}
            </h2>
          )}
          {cartography.description && (
            <p className="text-[0.95rem] text-text-dim leading-[1.85] max-w-2xl">
              {cartography.description}
            </p>
          )}
        </div>
      )}

      <div className="relative bg-bg/50 border border-border-subtle p-4 md:p-6">
        <svg
          viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
          className="w-full h-auto"
          style={{ maxHeight: compact ? 380 : 560 }}
          role="img"
          aria-label={cartography.name || 'Cartografia'}
        >
          <defs>
            <radialGradient id={`cartoGlow-${cartography.slug}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#2E5240" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2E5240" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={viewBox.w / 2} cy={viewBox.h / 2} r={Math.min(viewBox.w, viewBox.h) / 2} fill={`url(#cartoGlow-${cartography.slug})`} />

          <g>
            {edges.map(([fromId, toId, weight], i) => {
              const a = nodes.find((n) => n.id === fromId);
              const b = nodes.find((n) => n.id === toId);
              if (!a || !b) return null;
              const active = hovered === fromId || hovered === toId;
              const w = Math.max(0.5, Math.min(2.5, 0.5 + (weight || 1) * 0.3));
              return (
                <line
                  key={`${fromId}-${toId}-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#2E5240"
                  strokeWidth={active ? w + 0.6 : w}
                  strokeOpacity={active ? 0.7 : 0.18}
                  style={{ transition: 'stroke-opacity 250ms, stroke-width 250ms' }}
                />
              );
            })}
          </g>

          <g>
            {nodes.map((n) => (
              <Node
                key={n.id}
                node={n}
                hovered={hovered}
                onHover={setHovered}
                onLeave={() => setHovered(null)}
                onClick={setSelected}
              />
            ))}
          </g>
        </svg>

        {!compact && (
          <div className="mt-6 min-h-[3.5rem] border-t border-border-subtle pt-4 flex items-baseline gap-4 flex-wrap">
            {hoveredNode ? (
              <>
                <span className="font-mono text-[0.6rem] text-accent tracking-[0.25em] uppercase">
                  {hoveredNode.label}
                </span>
                <span className="font-serif italic text-[1.05rem] text-text-bright">
                  {hoveredNode.axiom}
                </span>
                <span className="font-mono text-[0.55rem] text-accent/70 tracking-[0.22em] uppercase ml-auto">
                  Clique para explorar →
                </span>
              </>
            ) : (
              <span className="font-mono text-[0.6rem] text-text-dim/70 tracking-[0.25em] uppercase">
                {nodes.length} conceitos · {edges.length} relações · fonte: {cartography.source}
              </span>
            )}
          </div>
        )}
      </div>

      <CartographyDrawer node={selected} onClose={() => setSelected(null)} allNodes={nodes} edges={edges} />
    </div>
  );
}

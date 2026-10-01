'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  getCartographies, setCartographies,
  DEFAULT_CARTOGRAPHIES, DEFAULT_CARTO_NODES, DEFAULT_CARTO_EDGES,
  CARTO_TONES,
} from '@/lib/sitedata';
import { cartographyFromBlog, cartographyFromGlossario } from '@/lib/cartographyGenerators';

const INPUT = 'w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-sm font-sans rounded-lg px-3 py-2 transition-colors';
const TEXTAREA = INPUT + ' resize-y';
const LABEL = 'block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2';
const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
const BTN_DANGER = 'px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-sans rounded-lg hover:bg-red-500/10 transition-colors';

const TONE_COLOR = {
  accent:   '#2E5240',
  bright:   '#13211F',
  citrinit: '#962B24',
  rubedo:   '#962B24',
};

const slugify = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function readJsonSafe(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ============================================================
   CANVAS — SVG interativo estilo Obsidian (mantido do anterior)
============================================================ */
function GraphCanvas({
  nodes, edges, viewBox,
  selectedId, onSelect,
  linkingFromId, onStartLinking, onCancelLinking,
  onMoveNode, onAddEdge, onRemoveEdge,
}) {
  const svgRef = useRef(null);
  const [dragId, setDragId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [mousePos, setMousePos] = useState(null);

  const clientToSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const inv = ctm.inverse();
    const transformed = pt.matrixTransform(inv);
    return { x: transformed.x, y: transformed.y };
  };

  const handlePointerDown = (e, node) => {
    e.stopPropagation();
    if (linkingFromId) {
      if (linkingFromId !== node.id) onAddEdge(linkingFromId, node.id);
      onCancelLinking();
      return;
    }
    onSelect(node.id);
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    setDragId(node.id);
    setDragOffset({ dx: node.x - x, dy: node.y - y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    setMousePos({ x, y });
    if (!dragId) return;
    onMoveNode(dragId, x + dragOffset.dx, y + dragOffset.dy);
  };

  const handlePointerUp = (e) => {
    setDragId(null);
    if (e.currentTarget && e.pointerId != null) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  const handleCanvasClick = () => {
    if (linkingFromId) onCancelLinking();
    else onSelect(null);
  };

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const linkingFromNode = linkingFromId ? nodeMap[linkingFromId] : null;

  return (
    <div className="relative">
      {linkingFromId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] px-4 py-1.5 rounded-full font-mono text-[11px] font-semibold tracking-widest uppercase shadow-lg">
          Clique no nó destino · ESC ou clique fora para cancelar
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        className="w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.2)] rounded-lg select-none"
        style={{ aspectRatio: `${viewBox.w}/${viewBox.h}`, touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleCanvasClick}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2E5240" strokeOpacity="0.06" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={viewBox.w} height={viewBox.h} fill="url(#grid)" />

        <g>
          {edges.map((edge, i) => {
            const [from, to] = edge;
            const a = nodeMap[from];
            const b = nodeMap[to];
            if (!a || !b) return null;
            const involves = selectedId && (from === selectedId || to === selectedId);
            return (
              <g key={`${from}-${to}-${i}`} style={{ cursor: 'pointer' }}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="14" onClick={(e) => { e.stopPropagation(); onRemoveEdge(i); }} />
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2E5240" strokeOpacity={involves ? 0.85 : 0.35} strokeWidth={involves ? 1.4 : 0.9} className="pointer-events-none" />
              </g>
            );
          })}

          {linkingFromNode && mousePos && (
            <line x1={linkingFromNode.x} y1={linkingFromNode.y} x2={mousePos.x} y2={mousePos.y} stroke="#2E5240" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="4 4" className="pointer-events-none" />
          )}
        </g>

        <g>
          {nodes.map((n) => {
            const isSelected = selectedId === n.id;
            const isLinking = linkingFromId === n.id;
            const fill = TONE_COLOR[n.tone] || '#2E5240';
            return (
              <g
                key={n.id}
                onPointerDown={(e) => handlePointerDown(e, n)}
                style={{ cursor: dragId === n.id ? 'grabbing' : (linkingFromId ? 'crosshair' : 'grab') }}
              >
                {(isSelected || isLinking) && (
                  <circle cx={n.x} cy={n.y} r={n.size + 14} fill={fill} opacity={isLinking ? 0.3 : 0.18} />
                )}
                <circle cx={n.x} cy={n.y} r={n.size + 6} fill={fill} opacity="0.08" />
                {n.href && (
                  <circle cx={n.x} cy={n.y} r={n.size + 4} fill="none" stroke={fill} strokeWidth="0.4" strokeDasharray="2 3" opacity="0.6" />
                )}
                <circle cx={n.x} cy={n.y} r={n.size} fill="#F8F4EA" stroke={fill} strokeWidth={isSelected ? 2 : 1} />
                <text x={n.x} y={n.y + n.size + 14} textAnchor="middle" fontSize="11" fontFamily="var(--f-ui)" fill={isSelected ? '#13211F' : '#2C3A35'} className="pointer-events-none" style={{ letterSpacing: '0.02em' }}>
                  {n.label}
                </text>
                {n.href && (
                  <text x={n.x} y={n.y - n.size - 5} textAnchor="middle" fontSize="9" fill={fill} className="pointer-events-none" style={{ letterSpacing: '0.1em' }}>↗</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] text-[rgb(var(--texto-dim-rgb))] font-sans">
        <span><span className="text-[rgb(var(--acento-rgb))]">●</span> arraste para mover</span>
        <span><span className="text-[rgb(var(--acento-rgb))]">●</span> clique no nó para selecionar</span>
        <span><span className="text-[rgb(var(--acento-rgb))]">●</span> clique numa aresta para removê-la</span>
        <span><span className="text-[rgb(var(--acento-rgb))]">●</span> use &ldquo;Ligar&rdquo; na sidebar para criar arestas</span>
      </div>
    </div>
  );
}

/* ============================================================
   Node Inspector (sidebar)
============================================================ */
function NodeInspector({ node, onChange, onDelete, onStartLink }) {
  if (!node) {
    return (
      <div className={CARD + ' h-full flex flex-col items-center justify-center text-center'}>
        <div className="font-serif italic text-[rgb(var(--texto-dim-rgb))] text-sm mb-2">Nenhum nó selecionado</div>
        <div className="text-[11px] text-[rgb(var(--texto-dim-rgb))] font-sans">Clique num nó no canvas para editar suas propriedades</div>
      </div>
    );
  }
  const update = (k, v) => onChange({ ...node, [k]: v });
  return (
    <div className={CARD + ' space-y-3'}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif text-lg text-[rgb(var(--texto-forte-rgb))]">Editando nó</h3>
        <span className="w-4 h-4 rounded-full" style={{ background: TONE_COLOR[node.tone] || '#2E5240' }} title={node.tone} />
      </div>
      <div>
        <label className={LABEL}>Label</label>
        <input value={node.label} onChange={(e) => update('label', e.target.value)} className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>ID (slug)</label>
        <input value={node.id} onChange={(e) => update('id', e.target.value)} className={INPUT + ' font-mono text-xs'} />
        <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] mt-1 italic">Trocar o ID quebra arestas existentes — evite.</p>
      </div>
      <div>
        <label className={LABEL}>Axioma (frase curta)</label>
        <input value={node.axiom || ''} onChange={(e) => update('axiom', e.target.value)} placeholder="centro arquetípico" className={INPUT + ' italic'} />
      </div>
      <div>
        <label className={LABEL}>Texto rico (markdown — aparece no drawer ao clicar)</label>
        <textarea value={node.richContent || ''} onChange={(e) => update('richContent', e.target.value)} rows={4} placeholder="Parágrafos separados por linha em branco. Aparece quando o usuário clica no nó." className={TEXTAREA} />
      </div>
      <div>
        <label className={LABEL}>Link (clicável)</label>
        <input value={node.href || ''} onChange={(e) => update('href', e.target.value)} placeholder="/materiais#projecao  ou  https://..." className={INPUT + ' text-xs font-mono'} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Tom</label>
          <select value={node.tone} onChange={(e) => update('tone', e.target.value)} className={INPUT + ' text-xs'}>
            {CARTO_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Tamanho</label>
          <input type="number" min="8" max="40" value={node.size} onChange={(e) => update('size', Number(e.target.value))} className={INPUT + ' text-xs'} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>X</label>
          <input type="number" value={Math.round(node.x)} onChange={(e) => update('x', Number(e.target.value))} className={INPUT + ' text-xs font-mono'} />
        </div>
        <div>
          <label className={LABEL}>Y</label>
          <input type="number" value={Math.round(node.y)} onChange={(e) => update('y', Number(e.target.value))} className={INPUT + ' text-xs font-mono'} />
        </div>
      </div>
      <div className="pt-3 border-t border-[rgb(var(--acento-rgb)/0.1)] flex gap-2">
        <button onClick={() => onStartLink(node.id)} className={BTN_PRIMARY + ' flex-1'}>Ligar a outro nó</button>
        <button onClick={onDelete} className={BTN_DANGER}>Apagar</button>
      </div>
    </div>
  );
}

/* ============================================================
   Props da cartografia (nome, source, layout, title, viewBox)
============================================================ */
function CartographyProps({ cartography, onChange }) {
  const c = cartography;
  const set = (k, v) => onChange({ ...c, [k]: v });
  return (
    <div className={CARD + ' space-y-3'}>
      <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest">Propriedades da cartografia</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Nome</label>
          <input value={c.name} onChange={(e) => set('name', e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Slug (identificador para embed)</label>
          <input
            value={c.slug}
            onChange={(e) => set('slug', e.target.value)}
            onBlur={(e) => set('slug', slugify(e.target.value))}
            className={INPUT + ' font-mono text-xs'}
            placeholder="home, conceitos, blog-auto..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Fonte dos nós</label>
          <select value={c.source} onChange={(e) => set('source', e.target.value)} className={INPUT}>
            <option value="manual">Manual (você define os nós)</option>
            <option value="blog">Auto a partir do blog (tags compartilhadas viram arestas)</option>
            <option value="glossario">Auto a partir do glossário (related.terms)</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Layout</label>
          <select value={c.layout} onChange={(e) => set('layout', e.target.value)} className={INPUT}>
            <option value="manual">Manual (posições fixas)</option>
            <option value="force">Force-directed (auto, d3-force)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Título exibido</label>
          <input value={c.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Conceitos" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Ênfase (itálico dourado)</label>
          <input value={c.titleEmphasis || ''} onChange={(e) => set('titleEmphasis', e.target.value)} placeholder="junguianos" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Descrição (parágrafo abaixo do título)</label>
        <textarea value={c.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={TEXTAREA} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>ViewBox · largura</label>
          <input type="number" value={c.viewBox?.w || 800} onChange={(e) => set('viewBox', { ...(c.viewBox || {}), w: Number(e.target.value) || 800 })} className={INPUT + ' text-xs font-mono'} />
        </div>
        <div>
          <label className={LABEL}>ViewBox · altura</label>
          <input type="number" value={c.viewBox?.h || 520} onChange={(e) => set('viewBox', { ...(c.viewBox || {}), h: Number(e.target.value) || 520 })} className={INPUT + ' text-xs font-mono'} />
        </div>
      </div>

      {c.source !== 'manual' && (
        <p className="text-xs text-[rgb(var(--acento-rgb))] italic bg-[rgb(var(--acento-rgb)/0.06)] border border-[rgb(var(--acento-rgb)/0.2)] rounded-lg p-3">
          Esta cartografia é auto-gerada a partir do {c.source === 'blog' ? 'blog' : 'glossário'}.
          Os nós/arestas no canvas são apenas referência — o site sempre regenera em runtime.
        </p>
      )}
    </div>
  );
}

/* ============================================================
   Lista de cartografias (topbar)
============================================================ */
function CartographyList({ list, activeSlug, onSelect, onCreate, onDuplicate, onRemove }) {
  return (
    <div className={CARD + ' space-y-3'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-lg text-[rgb(var(--texto-forte-rgb))]">Cartografias</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans">
            {list.length} {list.length === 1 ? 'cartografia' : 'cartografias'} · embeddáveis via slug em qualquer página
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onCreate} className={BTN_SECONDARY}>+ Nova</button>
          {activeSlug !== 'home' && <button onClick={onRemove} className={BTN_DANGER}>Apagar atual</button>}
          <button onClick={onDuplicate} className={BTN_SECONDARY}>Duplicar atual</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {list.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelect(c.slug)}
            className={`px-3 py-2 text-xs font-sans rounded-lg transition-all ${
              activeSlug === c.slug
                ? 'bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] font-semibold'
                : 'bg-[rgb(var(--fundo-rgb))] text-[rgb(var(--texto-rgb))] hover:text-[rgb(var(--acento-rgb))] border border-[rgb(var(--acento-rgb)/0.15)]'
            }`}
          >
            {c.name}
            <span className="ml-2 font-mono text-[10px] opacity-60">{c.source}/{c.layout}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN — wrapper que gerencia a lista de cartografias
============================================================ */
export default function CartographyManager({ addToast, addLogEntry }) {
  const [list, setList] = useState([]);
  const [activeSlug, setActiveSlug] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [linkingFromId, setLinkingFromId] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const initial = getCartographies();
    setList(initial);
    if (!initial.find((c) => c.slug === 'home') && initial[0]) setActiveSlug(initial[0].slug);
  }, []);

  // Reseta UI ao trocar de cartografia
  useEffect(() => {
    setSelectedId(null);
    setLinkingFromId(null);
    setDirty(false);
  }, [activeSlug]);

  // ESC cancela ligação ou seleção
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (linkingFromId) setLinkingFromId(null);
        else setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [linkingFromId]);

  const active = list.find((c) => c.slug === activeSlug) || list[0] || null;

  const updateActive = (updater) => {
    setList((prev) => {
      const next = prev.map((c) => (c.slug === activeSlug ? (typeof updater === 'function' ? updater(c) : { ...c, ...updater }) : c));
      return next;
    });
    setDirty(true);
  };

  const persistAll = () => {
    setCartographies(list);
    setDirty(false);
    addLogEntry?.('Cartografias salvas', `${list.length} no total`);
    addToast?.('Cartografias salvas', 'success');
  };

  // Props da cartografia ativa (salva imediato pra não precisar de Salvar pra mudar nome/source)
  const handlePropsChange = (newCarto) => {
    // Se slug mudou, atualiza activeSlug
    const oldSlug = active?.slug;
    setList((prev) => prev.map((c) => (c.slug === oldSlug ? newCarto : c)));
    if (newCarto.slug !== oldSlug) setActiveSlug(newCarto.slug);
    setDirty(true);
  };

  // Operações sobre nodes/edges da cartografia ativa
  const updateNode = (id, partial) => {
    updateActive((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === id ? { ...n, ...partial } : n)) }));
  };

  const moveNode = (id, x, y) => {
    if (!active) return;
    const w = active.viewBox?.w || 800;
    const h = active.viewBox?.h || 520;
    const clamped = { x: Math.max(20, Math.min(w - 20, x)), y: Math.max(20, Math.min(h - 20, y)) };
    updateActive((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === id ? { ...n, ...clamped } : n)) }));
  };

  const replaceNodeFull = (oldId, newNode) => {
    updateActive((c) => {
      const nodes = c.nodes.map((n) => (n.id === oldId ? newNode : n));
      const edges = oldId === newNode.id
        ? c.edges
        : c.edges.map((e) => [e[0] === oldId ? newNode.id : e[0], e[1] === oldId ? newNode.id : e[1], ...(e.slice(2) || [])]);
      return { ...c, nodes, edges };
    });
    if (oldId !== newNode.id && selectedId === oldId) setSelectedId(newNode.id);
  };

  const addNode = () => {
    if (!active) return;
    const w = active.viewBox?.w || 800;
    const h = active.viewBox?.h || 520;
    let id = `node-${Date.now().toString(36).slice(-5)}`;
    while (active.nodes.some((n) => n.id === id)) id += 'x';
    const cx = w / 2 + (Math.random() - 0.5) * 60;
    const cy = h / 2 + (Math.random() - 0.5) * 60;
    const newNode = { id, label: 'Novo conceito', x: cx, y: cy, size: 16, tone: 'bright', axiom: '', href: '', richContent: '' };
    updateActive((c) => ({ ...c, nodes: [...c.nodes, newNode] }));
    setSelectedId(id);
  };

  const removeNode = (id) => {
    if (!active) return;
    const node = active.nodes.find((n) => n.id === id);
    if (!node) return;
    if (!confirm(`Remover nó "${node.label}"?`)) return;
    updateActive((c) => ({ ...c, nodes: c.nodes.filter((n) => n.id !== id), edges: c.edges.filter((e) => e[0] !== id && e[1] !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const addEdge = (from, to) => {
    if (!from || !to || from === to || !active) return;
    if (active.edges.some(([f, t]) => (f === from && t === to) || (f === to && t === from))) {
      addToast?.('Aresta já existe', 'warning');
      return;
    }
    updateActive((c) => ({ ...c, edges: [...c.edges, [from, to]] }));
    addToast?.(`Conectou ${from} → ${to}`, 'success');
  };

  const removeEdge = (idx) => {
    updateActive((c) => ({ ...c, edges: c.edges.filter((_, i) => i !== idx) }));
  };

  // CRUD da lista de cartografias
  const createNew = () => {
    const name = prompt('Nome da nova cartografia:', 'Nova cartografia');
    if (!name) return;
    let slug = slugify(name);
    let i = 1;
    while (list.some((c) => c.slug === slug)) slug = `${slugify(name)}-${i++}`;
    const novo = {
      id: slug,
      slug,
      name,
      source: 'manual',
      layout: 'manual',
      title: name,
      titleEmphasis: '',
      description: '',
      viewBox: { w: 800, h: 520 },
      nodes: [],
      edges: [],
    };
    const next = [...list, novo];
    setList(next);
    setCartographies(next);
    setActiveSlug(slug);
    addLogEntry?.('Cartografia criada', name);
    addToast?.('Cartografia criada', 'success');
  };

  const duplicateActive = () => {
    if (!active) return;
    let slug = `${active.slug}-copia`;
    let i = 1;
    while (list.some((c) => c.slug === slug)) slug = `${active.slug}-copia-${i++}`;
    const novo = { ...active, slug, id: slug, name: `${active.name} (cópia)`, nodes: [...active.nodes], edges: [...active.edges] };
    const next = [...list, novo];
    setList(next);
    setCartographies(next);
    setActiveSlug(slug);
    addToast?.('Cartografia duplicada', 'success');
  };

  const removeActive = () => {
    if (!active || active.slug === 'home') return;
    if (!confirm(`Apagar cartografia "${active.name}"? Esta ação não pode ser desfeita.`)) return;
    const next = list.filter((c) => c.slug !== active.slug);
    setList(next);
    setCartographies(next);
    setActiveSlug('home');
    addToast?.('Cartografia apagada', 'success');
  };

  const resetActiveToDefault = () => {
    if (!active) return;
    if (active.slug !== 'home') {
      addToast?.('Só a cartografia "home" tem default.', 'warning');
      return;
    }
    if (!confirm('Restaurar cartografia "home" para os 12 conceitos junguianos padrão?')) return;
    updateActive((c) => ({ ...c, nodes: DEFAULT_CARTO_NODES, edges: DEFAULT_CARTO_EDGES }));
    setSelectedId(null);
    setLinkingFromId(null);
  };

  const regenerateAuto = () => {
    if (!active || active.source === 'manual') return;
    if (!confirm(`Regerar a cartografia "${active.name}" a partir do ${active.source}? Isso sobrescreve os nodes/edges salvos com os atuais do site.`)) return;
    const posts = readJsonSafe('raposa_admin_blog', []);
    const gloss = readJsonSafe('raposa_admin_glossario', []);
    const data = active.source === 'blog' ? cartographyFromBlog(posts) : cartographyFromGlossario(gloss);
    updateActive((c) => ({ ...c, nodes: data.nodes, edges: data.edges }));
    addToast?.(`Cartografia regerada (${data.nodes.length} nós · ${data.edges.length} arestas)`, 'success');
  };

  if (!active) {
    return (
      <div className={CARD + ' text-center py-12'}>
        <p className="text-sm text-[rgb(var(--texto-dim-rgb))] font-sans italic mb-4">Nenhuma cartografia.</p>
        <button onClick={createNew} className={BTN_PRIMARY}>+ Criar primeira</button>
      </div>
    );
  }

  const selectedNode = active.nodes.find((n) => n.id === selectedId) || null;
  const viewBox = active.viewBox || { w: 800, h: 520 };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
      <CartographyList
        list={list}
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
        onCreate={createNew}
        onDuplicate={duplicateActive}
        onRemove={removeActive}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Editando: {active.name}</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">
            {active.nodes.length} nós · {active.edges.length} arestas · slug: <span className="font-mono">{active.slug}</span>
            {dirty && <span className="ml-2 text-amber-400">• alterações não salvas</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {active.source === 'manual' && <button onClick={addNode} className={BTN_SECONDARY}>+ Nó</button>}
          {active.source !== 'manual' && <button onClick={regenerateAuto} className={BTN_SECONDARY}>Regerar de {active.source}</button>}
          {active.slug === 'home' && <button onClick={resetActiveToDefault} className={BTN_SECONDARY}>Restaurar default</button>}
          <button onClick={persistAll} disabled={!dirty} className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}>
            Salvar tudo
          </button>
        </div>
      </div>

      <CartographyProps cartography={active} onChange={handlePropsChange} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className={CARD + ' p-4'}>
          <GraphCanvas
            nodes={active.nodes}
            edges={active.edges}
            viewBox={viewBox}
            selectedId={selectedId}
            onSelect={setSelectedId}
            linkingFromId={linkingFromId}
            onStartLinking={setLinkingFromId}
            onCancelLinking={() => setLinkingFromId(null)}
            onMoveNode={moveNode}
            onAddEdge={addEdge}
            onRemoveEdge={removeEdge}
          />
        </div>

        <div>
          <NodeInspector
            node={selectedNode}
            onChange={(newNode) => replaceNodeFull(selectedId, newNode)}
            onDelete={() => removeNode(selectedId)}
            onStartLink={(id) => setLinkingFromId(id)}
          />

          <div className={CARD + ' mt-4'}>
            <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2">Embed em qualquer página</h3>
            <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] font-sans mb-2">
              Use o shortcode abaixo em posts do blog:
            </p>
            <code className="block text-[11px] text-[rgb(var(--acento-rgb))] font-mono bg-[rgb(var(--fundo-rgb))] p-2 rounded border border-[rgb(var(--acento-rgb)/0.15)]">
              [[carto:{active.slug}]]
            </code>
            <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] font-sans mt-2 italic">
              Também aparece automaticamente no bloco "Cartografia" do /trilhas quando escolhida no admin.
            </p>
          </div>
        </div>
      </div>

      {dirty && (
        <div className="sticky bottom-4 z-30 bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb))] rounded-xl p-3 flex items-center justify-between shadow-xl">
          <span className="text-sm text-[rgb(var(--texto-forte-rgb))] font-sans">Você tem alterações não salvas.</span>
          <button onClick={persistAll} className={BTN_PRIMARY}>Salvar tudo</button>
        </div>
      )}
    </motion.div>
  );
}

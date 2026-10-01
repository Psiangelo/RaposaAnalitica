'use client';
import { resolveImageSrc } from '@/lib/basepath';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrilhas, setTrilhas, getMaterials, getGlossario, getCartographies, getAreas, setAreas } from '@/lib/sitedata';
import { LINK_KINDS, BLOCK_KINDS, INNER_BLOCK_KINDS, migrateStageToBlocks, migrateTrilhaBlocks } from '@/lib/linkResolver';
import { TRILHA_ICON_SLUGS, STAGE_ICON_SLUGS, ALL_ICON_SLUGS, DEFAULT_TRILHA_ICON, DEFAULT_STAGE_ICON, defaultIconForKind, iconLabel } from '@/lib/trilhaIcons';
import { DEFAULT_AREA_ID, DEFAULT_AREAS, findArea } from '@/lib/areas';
import { EXTRA_COLOR, EXTRA_ICON, isExtra } from '@/lib/extraTone';
import TrilhaIcon from '@/components/estudos/icons';
import IconPicker from './IconPicker';
import MarkdownTextarea from './MarkdownTextarea';

const INPUT = 'w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-sm font-sans rounded-lg px-3 py-2 transition-colors';
const TEXTAREA = INPUT + ' resize-y';
const LABEL = 'block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2';
const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
const BTN_DANGER = 'px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-sans rounded-lg hover:bg-red-500/10 transition-colors';

const ARCHETYPES = ['Persona', 'Self', 'Anima', 'Animus', 'Sombra'];
const STAGE_KINDS = ['livro', 'leitura', 'mapa', 'curso', 'ensaio', 'video', 'extra'];
const LEVELS = ['Introdutório', 'Intermediário', 'Avançado'];

function readJsonSafe(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const EMPTY_TRILHA = () => ({
  id: `trilha-${Date.now().toString(36)}`,
  slug: '',
  name: '',
  subtitle: '',
  description: '',
  coverImage: '',
  area: DEFAULT_AREA_ID,
  icon: DEFAULT_TRILHA_ICON,
  thumbMode: 'image',
  archetype: '',
  duration: '',
  level: '',
  stages: [],
});

const EMPTY_STAGE = (idx = 0) => ({
  id: `stage-${Date.now().toString(36).slice(-5)}`,
  slug: `etapa-${idx + 1}`,
  title: '',
  kind: 'leitura',
  icon: DEFAULT_STAGE_ICON,
  summary: '',
  intro: '',
  thumbMode: 'image',
  blocks: [],
});

const EMPTY_AREA = () => ({
  id: `area-${Date.now().toString(36)}`,
  slug: '',
  label: '',
  icon: 'compass',
  color: '#2E5240',
});

const EMPTY_BLOCK = (type = 'text') => {
  switch (type) {
    case 'text':        return { type, body: '' };
    case 'link':        return { type, link: { kind: 'material', value: '', label: '' } };
    case 'media':       return { type, provider: 'youtube', url: '', caption: '' };
    case 'embed':       return { type, html: '', caption: '' };
    case 'cartography': return { type, slug: 'home', caption: '' };
    case 'quote':       return { type, body: '', cite: '' };
    case 'substage':    return {
      type,
      id: `substage-${Date.now().toString(36).slice(-5)}`,
      title: '',
      intro: '',
      blocks: [],
    };
    default:            return { type: 'text', body: '' };
  }
};

/* ───────────────────── ExtraToggle ─────────────────────
   Checkbox cerimonial em roxo que marca trilha/etapa/sub-etapa como "Extra".
   Quando marcado, força accent roxo no front e estrela como ícone.
*/
function ExtraToggle({ value, onChange, label = 'Extra', hint }) {
  const active = value === true;
  return (
    <label
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors"
      style={{
        background: active ? `${EXTRA_COLOR}1a` : 'transparent',
        borderColor: active ? `${EXTRA_COLOR}66` : 'rgb(var(--acento-rgb)/0.15)',
        color: active ? EXTRA_COLOR : '#2C3A35',
      }}
      title={hint || 'Marca como conteúdo extra — accent roxo e ícone de estrela'}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-[3px]"
        style={{
          background: active ? EXTRA_COLOR : 'transparent',
          border: `1px solid ${active ? EXTRA_COLOR : 'rgb(var(--acento-rgb)/0.3)'}`,
        }}
      >
        {active && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#F2EBDC" strokeWidth="3.5" className="w-3 h-3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      <TrilhaIcon name={EXTRA_ICON} size={13} />
      <span className="font-mono text-[10px] tracking-widest uppercase">{label}</span>
    </label>
  );
}

/* ───────────────────── FlagToggle ─────────────────────
   Toggle compacto e genérico pra flags simples (ocultar, em breve).
*/
function FlagToggle({ value, onChange, label, hint, color = '#2E5240', icon }) {
  const active = value === true;
  return (
    <label
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors"
      style={{
        background: active ? `${color}1a` : 'transparent',
        borderColor: active ? `${color}66` : 'rgb(var(--acento-rgb)/0.15)',
        color: active ? color : '#2C3A35',
      }}
      title={hint || label}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-[3px]"
        style={{
          background: active ? color : 'transparent',
          border: `1px solid ${active ? color : 'rgb(var(--acento-rgb)/0.3)'}`,
        }}
      >
        {active && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#F2EBDC" strokeWidth="3.5" className="w-3 h-3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      {icon}
      <span className="font-mono text-[10px] tracking-widest uppercase">{label}</span>
    </label>
  );
}

/* ───────────────────── ThumbModeToggle ───────────────────── */
function ThumbModeToggle({ value, onChange }) {
  const opts = [
    {
      v: 'image',
      label: 'Imagem',
      hint: 'capa',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 17 L15 12 L3 18" />
        </svg>
      ),
    },
    {
      v: 'icon',
      label: 'Ícone',
      hint: 'selo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6 L13.5 12 L12 13 L10.5 12 Z" fill="currentColor" />
          <path d="M10.5 12 L12 18 L13.5 12 L12 11 Z" />
        </svg>
      ),
    },
  ];
  return (
    <div className="inline-flex p-0.5 rounded-lg border border-[rgb(var(--acento-rgb)/0.15)] bg-[rgb(var(--fundo-rgb))]">
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={active}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-[10px] tracking-widest uppercase transition-colors ${
              active
                ? 'bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))]'
                : 'text-[rgb(var(--texto-rgb))] hover:text-[rgb(var(--acento-rgb))]'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────── LinkPicker (interno do block tipo 'link') ───────────────────── */
function LinkPicker({ link, onChange, lists }) {
  const safeLink = link && link.kind ? link : { kind: 'material', value: '', label: '' };
  const update = (k, v) => onChange({ ...safeLink, [k]: v });

  const renderValue = () => {
    switch (safeLink.kind) {
      case 'material':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher material —</option>
            {lists.materials.map((m) => (<option key={m.id} value={m.id}>{m.title}</option>))}
          </select>
        );
      case 'blog':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher post —</option>
            {lists.posts.map((p) => (<option key={p.slug || p.id} value={p.slug || p.id}>{p.title}</option>))}
          </select>
        );
      case 'course':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher curso —</option>
            {lists.courses.map((c) => (<option key={c.slug || c.id} value={c.slug || c.id}>{c.title}</option>))}
          </select>
        );
      case 'glossario':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher verbete —</option>
            {lists.glossario.map((g) => (<option key={g.slug} value={g.slug}>{g.term}</option>))}
          </select>
        );
      case 'youtube':
      case 'drive':
      case 'url':
        return (
          <input
            value={safeLink.value || ''}
            onChange={(e) => update('value', e.target.value)}
            placeholder={safeLink.kind === 'youtube' ? 'https://www.youtube.com/watch?v=...' : safeLink.kind === 'drive' ? 'https://drive.google.com/...' : 'https://...'}
            className={INPUT + ' font-mono text-xs'}
          />
        );
      default:
        return <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic py-2">Tipo não suportado aqui.</p>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
        <select value={safeLink.kind} onChange={(e) => update('kind', e.target.value)} className={INPUT}>
          {LINK_KINDS.filter((k) => k.value !== 'none' && k.value !== 'embed').map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        {renderValue()}
      </div>
      <input
        value={safeLink.label || ''}
        onChange={(e) => update('label', e.target.value)}
        placeholder="Rótulo do card (opcional)"
        className={INPUT + ' text-xs'}
      />
    </div>
  );
}

/* ───────────────────── SubstageEditor (sub-bloco type='substage') ─────────────────────
   Edita um bloco substage: título, intro markdown e sub-lista de blocks internos.
   Os blocks internos usam o próprio BlockEditor com allowedKinds=INNER (sem substage aninhado).
*/
function SubstageEditor({ block, onChange, lists }) {
  const update = (k, v) => onChange({ ...block, [k]: v });
  const innerBlocks = Array.isArray(block.blocks) ? block.blocks : [];

  const addInner = () => onChange({ ...block, blocks: [...innerBlocks, EMPTY_BLOCK('text')] });
  const updateInner = (i, b) => onChange({ ...block, blocks: innerBlocks.map((x, j) => (j === i ? b : x)) });
  const removeInner = (i) => onChange({ ...block, blocks: innerBlocks.filter((_, j) => j !== i) });
  const moveInner = (i, delta) => {
    const swap = i + delta;
    if (swap < 0 || swap >= innerBlocks.length) return;
    const next = [...innerBlocks];
    [next[i], next[swap]] = [next[swap], next[i]];
    onChange({ ...block, blocks: next });
  };

  // Drag-drop dos blocks internos
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const onInnerDragStart = (e, i) => {
    setDragIdx(i);
    try { e.dataTransfer.effectAllowed = 'move'; } catch {}
  };
  const onInnerDragOver = (i) => setOverIdx(i);
  const onInnerDrop = (i) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
    const next = [...innerBlocks];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange({ ...block, blocks: next });
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <label className={LABEL}>Título da sub-etapa</label>
          <input
            value={block.title || ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Ex: Leia o capítulo 1"
            className={INPUT}
          />
        </div>
        <ExtraToggle
          value={block.extra === true}
          onChange={(v) => update('extra', v)}
          label="Sub-etapa extra"
          hint="Marca como extra — selo roxo + estrela. Útil pra leituras opcionais."
        />
      </div>

      <div>
        <label className={LABEL}>Descrição / abertura (markdown, opcional)</label>
        <MarkdownTextarea
          value={block.intro || ''}
          onChange={(v) => update('intro', v)}
          rows={3}
          placeholder="Contexto, instrução ou prosa que apresenta a sub-etapa…"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={LABEL + ' mb-0'}>
            Conteúdo dentro da sub-etapa ({innerBlocks.length} {innerBlocks.length === 1 ? 'bloco' : 'blocos'})
          </label>
          <button type="button" onClick={addInner} className={BTN_SECONDARY}>+ Bloco</button>
        </div>
        <div className="space-y-2 pl-2 border-l-2" style={{ borderColor: 'rgb(var(--acento-rgb)/0.18)' }}>
          {innerBlocks.map((b, i) => (
            <BlockEditor
              key={i}
              block={b}
              idx={i}
              onChange={(nb) => updateInner(i, nb)}
              onRemove={() => removeInner(i)}
              onMove={(delta) => moveInner(i, delta)}
              onDragStart={onInnerDragStart}
              onDragOver={onInnerDragOver}
              onDrop={onInnerDrop}
              isDragging={dragIdx === i}
              isOver={overIdx === i && dragIdx !== null && dragIdx !== i}
              lists={lists}
              allowedKinds={INNER_BLOCK_KINDS}
            />
          ))}
          {innerBlocks.length === 0 && (
            <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic py-3 px-2">
              Sub-etapa vazia. Adicione texto, link a material/post, vídeo, citação…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── BlockEditor (1 bloco) ───────────────────── */
function BlockEditor({ block, idx, onChange, onRemove, onMove, onDragStart, onDragOver, onDrop, isDragging, isOver, lists, allowedKinds }) {
  const update = (k, v) => onChange({ ...block, [k]: v });
  const kinds = allowedKinds || BLOCK_KINDS;

  const renderFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <div>
            <label className={LABEL}>Texto (parágrafos separados por linha em branco)</label>
            <MarkdownTextarea
              value={block.body || ''}
              onChange={(v) => update('body', v)}
              rows={6}
              placeholder="**negrito**, *itálico dourado*, [link](url), citações com >"
            />
          </div>
        );
      case 'link':
        return (
          <div>
            <label className={LABEL}>Material vinculado</label>
            <LinkPicker link={block.link} onChange={(link) => update('link', link)} lists={lists} />
          </div>
        );
      case 'media':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2">
              <select value={block.provider || 'youtube'} onChange={(e) => update('provider', e.target.value)} className={INPUT}>
                <option value="youtube">YouTube</option>
                <option value="drive">Google Drive</option>
              </select>
              <input value={block.url || ''} onChange={(e) => update('url', e.target.value)} placeholder="URL do vídeo" className={INPUT + ' font-mono text-xs'} />
            </div>
            <input value={block.caption || ''} onChange={(e) => update('caption', e.target.value)} placeholder="Legenda (opcional)" className={INPUT + ' text-xs'} />
          </div>
        );
      case 'embed':
        return (
          <div className="space-y-2">
            <textarea value={block.html || ''} onChange={(e) => update('html', e.target.value)} rows={4} placeholder='<iframe src="..." ...></iframe>' className={TEXTAREA + ' font-mono text-xs'} />
            <input value={block.caption || ''} onChange={(e) => update('caption', e.target.value)} placeholder="Legenda (opcional)" className={INPUT + ' text-xs'} />
          </div>
        );
      case 'cartography':
        return (
          <div className="space-y-2">
            <select value={block.slug || 'home'} onChange={(e) => update('slug', e.target.value)} className={INPUT}>
              {lists.cartographies.map((c) => (<option key={c.slug} value={c.slug}>{c.name} · {c.source}</option>))}
            </select>
            <input value={block.caption || ''} onChange={(e) => update('caption', e.target.value)} placeholder="Legenda (opcional)" className={INPUT + ' text-xs'} />
          </div>
        );
      case 'quote':
        return (
          <div className="space-y-2">
            <textarea value={block.body || ''} onChange={(e) => update('body', e.target.value)} rows={3} className={TEXTAREA} placeholder="Texto da citação" />
            <input value={block.cite || ''} onChange={(e) => update('cite', e.target.value)} placeholder="Autor / fonte (opcional)" className={INPUT + ' text-xs'} />
          </div>
        );
      case 'substage':
        return <SubstageEditor block={block} onChange={onChange} lists={lists} />;
      default:
        return null;
    }
  };

  const isSubstage = block.type === 'substage';
  const subExtra = isSubstage && isExtra(block);
  const subAccent = subExtra ? EXTRA_COLOR : '#2E5240';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, idx)}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(idx); }}
      onDragEnd={() => onDragOver?.(null)}
      onDrop={(e) => { e.preventDefault(); onDrop?.(idx); }}
      className={`border-l-2 rounded-lg p-4 space-y-3 transition-all ${
        isDragging ? 'opacity-40' : ''
      } ${isOver ? 'ring-2 ring-[rgb(var(--acento-rgb))]' : ''}`}
      style={{
        background: isSubstage ? (subExtra ? `${EXTRA_COLOR}10` : 'rgb(var(--acento-rgb)/0.06)') : '#F2EBDC',
        borderLeftColor: isSubstage ? subAccent : 'rgb(var(--acento-rgb)/0.2)',
        borderTopColor: subExtra ? `${EXTRA_COLOR}33` : 'rgb(var(--acento-rgb)/0.12)',
        borderRightColor: subExtra ? `${EXTRA_COLOR}33` : 'rgb(var(--acento-rgb)/0.12)',
        borderBottomColor: subExtra ? `${EXTRA_COLOR}33` : 'rgb(var(--acento-rgb)/0.12)',
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderTopStyle: 'solid',
        borderRightStyle: 'solid',
        borderBottomStyle: 'solid',
      }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="cursor-grab text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] select-none" title="Arraste para reordenar">⋮⋮</span>
          {isSubstage ? (
            <span
              className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded inline-flex items-center gap-1.5"
              style={{
                color: '#F2EBDC',
                background: subAccent,
              }}
              title={subExtra ? 'Sub-etapa extra' : 'Esta é uma sub-etapa concluível'}
            >
              {subExtra ? (
                <>
                  <TrilhaIcon name={EXTRA_ICON} size={10} />
                  Sub-etapa Extra
                </>
              ) : (
                '◆ Sub-etapa'
              )}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-[rgb(var(--acento-rgb))] tracking-widest uppercase">Bloco {idx + 1}</span>
          )}
          <select
            value={block.type}
            onChange={(e) => {
              if (!confirm(`Trocar tipo do ${isSubstage ? 'sub-etapa' : 'bloco'}? O conteúdo atual será descartado.`)) return;
              onChange(EMPTY_BLOCK(e.target.value));
            }}
            className={INPUT + ' text-xs max-w-[320px]'}
          >
            {kinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onMove(-1)} className="px-2 py-1 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))]">↑</button>
          <button onClick={() => onMove(1)} className="px-2 py-1 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))]">↓</button>
          <button onClick={onRemove} className={BTN_DANGER}>Remover</button>
        </div>
      </div>
      {renderFields()}
    </div>
  );
}

/* ───────────────────── StageEditor ───────────────────── */
function StageEditor({ stage, idx, onChange, onRemove, onMove, onDragStart, onDragOver, onDrop, isDragging, isOver, lists }) {
  const update = (k, v) => onChange({ ...stage, [k]: v });

  const addBlock = (type = 'text') => onChange({ ...stage, blocks: [...(stage.blocks || []), EMPTY_BLOCK(type)] });
  const addSubstage = () => addBlock('substage');
  const updateBlock = (i, b) => onChange({ ...stage, blocks: stage.blocks.map((x, j) => j === i ? b : x) });
  const removeBlock = (i) => onChange({ ...stage, blocks: stage.blocks.filter((_, j) => j !== i) });
  const moveBlock = (i, delta) => {
    const next = [...(stage.blocks || [])];
    const swap = i + delta;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onChange({ ...stage, blocks: next });
  };

  // Drag-and-drop de blocos
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const onBlockDragStart = (e, i) => {
    setDragIdx(i);
    try { e.dataTransfer.effectAllowed = 'move'; } catch {}
  };
  const onBlockDragOver = (i) => setOverIdx(i);
  const onBlockDrop = (i) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
    const next = [...(stage.blocks || [])];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange({ ...stage, blocks: next });
    setDragIdx(null);
    setOverIdx(null);
  };

  const stageExtra = isExtra(stage);
  const stageHeadColor = stageExtra ? EXTRA_COLOR : '#2E5240';
  const stageHeadIcon = stageExtra ? EXTRA_ICON : (stage.icon || defaultIconForKind(stage.kind));

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart?.(e, idx); try { e.dataTransfer.effectAllowed = 'move'; } catch {} }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver?.(idx); }}
      onDragEnd={() => onDragOver?.(null)}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop?.(idx); }}
      className={`${CARD} space-y-4 transition-all ${isDragging ? 'opacity-40' : ''} ${isOver ? 'ring-2 ring-[rgb(var(--acento-rgb))]' : ''}`}
      style={stageExtra ? { borderColor: `${EXTRA_COLOR}55`, background: `${EXTRA_COLOR}0a` } : undefined}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="cursor-grab text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] select-none" title="Arraste para reordenar">⋮⋮</span>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border"
            style={{ borderColor: `${stageHeadColor}55`, color: stageHeadColor }}
          >
            <TrilhaIcon name={stageHeadIcon} size={16} />
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: stageHeadColor }}>
            Etapa {idx + 1}{stageExtra ? ' · Extra' : ''}
          </span>
          {stage.title && (
            <span className="font-serif text-sm text-[rgb(var(--texto-forte-rgb))] truncate max-w-[280px]">· {stage.title}</span>
          )}
          <ExtraToggle
            value={stageExtra}
            onChange={(v) => update('extra', v)}
            label="Etapa extra"
            hint="Marca como etapa extra — accent roxo, ícone de estrela e badge no front."
          />
          <FlagToggle
            value={stage.hidden === true}
            onChange={(v) => update('hidden', v)}
            label="Ocultar"
            hint="Some completamente do site (timeline + acesso direto)."
            color="#9A7552"
          />
          <FlagToggle
            value={stage.comingSoon === true}
            onChange={(v) => update('comingSoon', v)}
            label="Em breve"
            hint="Aparece com badge 'Em breve' e o link fica bloqueado no front."
            color="#962B24"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={() => onMove(-1)} className="px-2 py-1 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))]">↑</button>
          <button onClick={() => onMove(1)} className="px-2 py-1 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))]">↓</button>
          <button onClick={onRemove} className={BTN_DANGER}>Remover etapa</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
        <div>
          <label className={LABEL}>Título</label>
          <input
            value={stage.title}
            onChange={(e) => {
              const title = e.target.value;
              const newSlug = !stage.slug || stage.slug.startsWith('etapa-') ? slugify(title) : stage.slug;
              onChange({ ...stage, title, slug: newSlug });
            }}
            placeholder="Ex: I · Antes do Jung"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Tipo (rótulo)</label>
          <select
            value={stage.kind || 'leitura'}
            onChange={(e) => {
              const kind = e.target.value;
              // Se o ícone ainda é o default inferido do kind anterior, atualiza pro novo default
              const wasInferred = !stage.icon || stage.icon === defaultIconForKind(stage.kind);
              onChange({ ...stage, kind, icon: wasInferred ? defaultIconForKind(kind) : stage.icon });
            }}
            className={INPUT}
          >
            {STAGE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>Ícone da etapa</label>
        <IconPicker
          value={stage.icon || defaultIconForKind(stage.kind)}
          onChange={(slug) => update('icon', slug)}
          slugs={STAGE_ICON_SLUGS}
        />
      </div>

      <div>
        <label className={LABEL}>Slug (URL: /trilhas/&lt;trilha&gt;/<span className="text-[rgb(var(--acento-rgb))]">{stage.slug}</span>)</label>
        <input
          value={stage.slug || ''}
          onChange={(e) => update('slug', e.target.value)}
          onBlur={(e) => update('slug', slugify(e.target.value))}
          className={INPUT + ' font-mono text-xs'}
        />
      </div>

      <div>
        <label className={LABEL}>Resumo (aparece no card e no hero da etapa)</label>
        <textarea value={stage.summary || ''} onChange={(e) => update('summary', e.target.value)} rows={2} className={TEXTAREA} placeholder="Frase curta que explica esta etapa..." />
      </div>

      <div>
        <label className={LABEL}>Introdução (markdown, opcional — aparece antes dos blocos na página da etapa)</label>
        <MarkdownTextarea
          value={stage.intro || ''}
          onChange={(v) => update('intro', v)}
          rows={4}
          placeholder="Prosa de abertura — apresente o tema da etapa, dê contexto, conduza o leitor para o conteúdo abaixo."
        />
      </div>

      <div>
        <label className={LABEL}>Imagem de capa da etapa (opcional)</label>
        <input
          value={stage.coverImage || ''}
          onChange={(e) => update('coverImage', e.target.value)}
          placeholder="https://... ou /images/capa.jpg"
          className={INPUT + ' text-xs font-mono'}
        />
        {stage.coverImage && (
          <div className="mt-2 w-32 h-20 rounded overflow-hidden border border-[rgb(var(--acento-rgb)/0.15)]">
            <img src={resolveImageSrc(stage.coverImage)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}
      </div>

      <div>
        <label className={LABEL}>Exibição do card</label>
        <ThumbModeToggle
          value={stage.thumbMode || 'image'}
          onChange={(v) => update('thumbMode', v)}
        />
        <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] font-sans mt-1.5 italic">
          {stage.thumbMode === 'icon'
            ? 'Mostra o ícone cerimonial grande (selo) — ignora capa e capa do material linkado.'
            : 'Mostra a capa da etapa, ou a do material/post linkado, ou (último recurso) o ícone.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <label className={LABEL + ' mb-0'}>
            Conteúdo da etapa ({(stage.blocks || []).length} {(stage.blocks || []).length === 1 ? 'item' : 'itens'})
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => addBlock('text')} className={BTN_SECONDARY}>+ Bloco</button>
            <button
              type="button"
              onClick={addSubstage}
              className="px-3 py-1.5 border text-xs font-sans rounded-lg transition-colors"
              style={{
                borderColor: 'rgb(var(--acento-rgb)/0.4)',
                background: 'rgb(var(--acento-rgb)/0.08)',
                color: '#2E5240',
              }}
              title="Adiciona uma sub-etapa concluível com título, descrição e conteúdo próprio"
            >
              + Sub-etapa
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] font-sans italic mb-3 -mt-1">
          Bloco = texto, link, vídeo, citação, etc. · Sub-etapa = caixa numerada e concluível
          (com título + descrição + blocos dentro), aparece com I, II, III na página.
        </p>
        <div className="space-y-3">
          {(stage.blocks || []).map((b, i) => (
            <BlockEditor
              key={i}
              block={b}
              idx={i}
              onChange={(nb) => updateBlock(i, nb)}
              onRemove={() => removeBlock(i)}
              onMove={(delta) => moveBlock(i, delta)}
              onDragStart={onBlockDragStart}
              onDragOver={onBlockDragOver}
              onDrop={onBlockDrop}
              isDragging={dragIdx === i}
              isOver={overIdx === i && dragIdx !== null && dragIdx !== i}
              lists={lists}
            />
          ))}
          {(stage.blocks || []).length === 0 && (
            <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic text-center py-6 border border-dashed border-[rgb(var(--acento-rgb)/0.15)] rounded-lg">
              Sem conteúdo. Use <span className="text-[rgb(var(--acento-rgb))]">+ Bloco</span> para texto, vídeo, link, citação… ou <span className="text-[rgb(var(--acento-rgb))]">+ Sub-etapa</span> para uma caixa numerada concluível.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── TrilhaEditor ───────────────────── */
function TrilhaEditor({ trilha, onChange, onCancel, onDelete, lists }) {
  const [draft, setDraft] = useState(() => migrateTrilhaBlocks(trilha));
  useEffect(() => setDraft(migrateTrilhaBlocks(trilha)), [trilha.id]);

  const update = (k, v) => setDraft({ ...draft, [k]: v });
  const updateStage = (idx, ns) => setDraft({ ...draft, stages: draft.stages.map((s, i) => i === idx ? ns : s) });
  const addStage = () => setDraft({ ...draft, stages: [...draft.stages, migrateStageToBlocks(EMPTY_STAGE(draft.stages.length), draft.stages.length)] });
  const removeStage = (idx) => setDraft({ ...draft, stages: draft.stages.filter((_, i) => i !== idx) });
  const moveStage = (idx, delta) => {
    const next = [...draft.stages];
    const swap = idx + delta;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setDraft({ ...draft, stages: next });
  };

  // Drag-and-drop entre etapas
  const [stageDragIdx, setStageDragIdx] = useState(null);
  const [stageOverIdx, setStageOverIdx] = useState(null);
  const onStageDragStart = (e, i) => setStageDragIdx(i);
  const onStageDragOver = (i) => setStageOverIdx(i);
  const onStageDrop = (i) => {
    if (stageDragIdx === null || stageDragIdx === i) { setStageDragIdx(null); setStageOverIdx(null); return; }
    const next = [...draft.stages];
    const [moved] = next.splice(stageDragIdx, 1);
    next.splice(i, 0, moved);
    setDraft({ ...draft, stages: next });
    setStageDragIdx(null);
    setStageOverIdx(null);
  };

  const trilhaExtra = isExtra(draft);

  return (
    <div
      className={CARD + ' space-y-5'}
      style={trilhaExtra ? { borderColor: `${EXTRA_COLOR}55`, background: `${EXTRA_COLOR}0a` } : undefined}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-serif text-[rgb(var(--texto-forte-rgb))]">
            {draft.name ? `Editar: ${draft.name}` : 'Nova trilha'}
          </h3>
          <ExtraToggle
            value={trilhaExtra}
            onChange={(v) => setDraft({ ...draft, extra: v })}
            label="Trilha extra"
            hint="Marca toda a trilha como extra — accent roxo, ícone de estrela, badge."
          />
          <FlagToggle
            value={draft.hidden === true}
            onChange={(v) => setDraft({ ...draft, hidden: v })}
            label="Ocultar"
            hint="Some completamente do site (listing /trilhas + link direto)."
            color="#9A7552"
          />
          <FlagToggle
            value={draft.comingSoon === true}
            onChange={(v) => setDraft({ ...draft, comingSoon: v })}
            label="Em breve"
            hint="Aparece no listing com badge 'Em breve' e link bloqueado."
            color="#962B24"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
          <button onClick={() => onChange(draft)} className={BTN_PRIMARY}>Salvar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Nome *</label>
          <input
            value={draft.name}
            onChange={(e) => {
              const name = e.target.value;
              const next = { ...draft, name };
              if (!draft.slug || draft.slug.startsWith('trilha-')) next.slug = slugify(name);
              setDraft(next);
            }}
            placeholder="Ex: Começando em Jung"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Subtítulo</label>
          <input value={draft.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="Para quem está chegando agora..." className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Slug (URL: /trilhas/<span className="text-[rgb(var(--acento-rgb))]">{draft.slug || draft.id}</span>)</label>
          <input
            value={draft.slug || ''}
            onChange={(e) => update('slug', e.target.value)}
            onBlur={(e) => update('slug', slugify(e.target.value))}
            className={INPUT + ' font-mono text-xs'}
          />
        </div>
        <div>
          <label className={LABEL}>Imagem de capa (opcional)</label>
          <input
            value={draft.coverImage || ''}
            onChange={(e) => update('coverImage', e.target.value)}
            placeholder="https://... ou /images/capa.jpg"
            className={INPUT + ' text-xs font-mono'}
          />
          {draft.coverImage && (
            <div className="mt-2 w-40 h-24 rounded overflow-hidden border border-[rgb(var(--acento-rgb)/0.15)]">
              <img src={resolveImageSrc(draft.coverImage)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className={LABEL}>Exibição do card da trilha (em /trilhas)</label>
        <ThumbModeToggle
          value={draft.thumbMode || 'image'}
          onChange={(v) => update('thumbMode', v)}
        />
        <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] font-sans mt-1.5 italic">
          {draft.thumbMode === 'icon'
            ? 'Mostra o ícone cerimonial gigante (selo) no listing — ignora a capa.'
            : 'Mostra a imagem de capa no listing, ou o ícone se não houver capa.'}
        </p>
      </div>

      <div>
        <label className={LABEL}>Descrição longa (opcional, markdown — aparece abaixo do hero)</label>
        <MarkdownTextarea
          value={draft.description || ''}
          onChange={(v) => update('description', v)}
          rows={4}
          placeholder="Apresentação curta da trilha — quem é o público, o que esperar, qual o resultado esperado."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Área (filtro principal em /trilhas)</label>
          <select
            value={draft.area || DEFAULT_AREA_ID}
            onChange={(e) => update('area', e.target.value)}
            className={INPUT}
          >
            {(lists.areas || DEFAULT_AREAS).map((a) => (
              <option key={a.slug} value={a.slug}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Ícone da trilha</label>
          {(() => {
            const activeArea = findArea(lists.areas || DEFAULT_AREAS, draft.area);
            return (
              <IconPicker
                value={draft.icon || DEFAULT_TRILHA_ICON}
                onChange={(slug) => update('icon', slug)}
                slugs={TRILHA_ICON_SLUGS}
                accent={activeArea?.color || '#2E5240'}
              />
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LABEL}>Nível (opcional)</label>
          <select value={draft.level || ''} onChange={(e) => update('level', e.target.value)} className={INPUT}>
            <option value="">— sem nível —</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Duração (opcional)</label>
          <input value={draft.duration || ''} onChange={(e) => update('duration', e.target.value)} placeholder="4 a 6 semanas" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Arquétipo / tom (opcional)</label>
          <select value={draft.archetype || ''} onChange={(e) => update('archetype', e.target.value)} className={INPUT}>
            <option value="">— sem tom —</option>
            {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={LABEL + ' mb-0'}>Etapas ({draft.stages.length})</label>
          <button onClick={addStage} className={BTN_SECONDARY}>+ Etapa</button>
        </div>
        <div className="space-y-4">
          {draft.stages.map((s, i) => (
            <StageEditor
              key={s.id || i}
              stage={s}
              idx={i}
              onChange={(ns) => updateStage(i, ns)}
              onRemove={() => removeStage(i)}
              onMove={(delta) => moveStage(i, delta)}
              onDragStart={onStageDragStart}
              onDragOver={onStageDragOver}
              onDrop={onStageDrop}
              isDragging={stageDragIdx === i}
              isOver={stageOverIdx === i && stageDragIdx !== null && stageDragIdx !== i}
              lists={lists}
            />
          ))}
          {draft.stages.length === 0 && (
            <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic text-center py-6 border border-dashed border-[rgb(var(--acento-rgb)/0.15)] rounded-lg">
              Nenhuma etapa ainda — clique em &ldquo;+ Etapa&rdquo;.
            </p>
          )}
        </div>
      </div>

      {onDelete && (
        <div className="pt-4 border-t border-[rgb(var(--acento-rgb)/0.1)] flex justify-end">
          <button onClick={onDelete} className={BTN_DANGER}>Apagar trilha</button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── AreasManager (sub-aba) ───────────────────── */
function AreasManager({ addToast, addLogEntry }) {
  const [list, setListLocal] = useState([]);

  useEffect(() => {
    setListLocal(getAreas());
  }, []);

  const persist = (next) => {
    setListLocal(next);
    setAreas(next);
  };

  const update = (idx, patch) => {
    persist(list.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  };

  const move = (idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= list.length) return;
    const next = [...list];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    persist(next);
  };

  const add = () => {
    persist([...list, EMPTY_AREA()]);
    addLogEntry?.('Área criada', 'Nova área');
  };

  const remove = (idx) => {
    if (list.length <= 1) {
      addToast?.('Mantenha ao menos uma área', 'error');
      return;
    }
    if (!confirm(`Apagar a área "${list[idx]?.label || ''}"? Trilhas órfãs caem na primeira área.`)) return;
    const removed = list[idx];
    persist(list.filter((_, i) => i !== idx));
    addLogEntry?.('Área apagada', removed?.label || '');
    addToast?.('Área apagada', 'success');
  };

  const onSlugBlur = (idx, raw) => update(idx, { slug: slugify(raw), id: slugify(raw) || `area-${idx}` });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-serif text-[rgb(var(--texto-forte-rgb))]">Áreas de estudo</h3>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1 max-w-2xl">
            Cada trilha pertence a uma área. A área é o filtro principal de /trilhas e define o accent visual.
            Comece com psicologia junguiana — crie filosofia, antropologia, ou outras conforme expandir.
          </p>
        </div>
        <button onClick={add} className={BTN_PRIMARY}>+ Nova área</button>
      </div>

      <div className="space-y-2">
        {list.map((a, i) => (
          <div key={a.id || i} className={CARD + ' space-y-3'}>
            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_70px_auto] gap-3 items-end">
              <div>
                <label className={LABEL}>Ordem</label>
                <div className="flex items-center gap-1 h-10">
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border"
                    style={{ color: a.color || '#2E5240', borderColor: `${a.color || '#2E5240'}55` }}
                    title={iconLabel(a.icon)}
                  >
                    <TrilhaIcon name={a.icon || 'compass'} size={18} />
                  </span>
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] disabled:opacity-30 leading-none">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] disabled:opacity-30 leading-none">↓</button>
                  </div>
                </div>
              </div>
              <div>
                <label className={LABEL}>Nome</label>
                <input
                  value={a.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Psicologia Junguiana"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Slug (URL/referência)</label>
                <input
                  value={a.slug}
                  onChange={(e) => update(i, { slug: e.target.value })}
                  onBlur={(e) => onSlugBlur(i, e.target.value)}
                  placeholder="psicologia-junguiana"
                  className={INPUT + ' font-mono text-xs'}
                />
              </div>
              <div>
                <label className={LABEL}>Cor</label>
                <input
                  type="color"
                  value={a.color || '#2E5240'}
                  onChange={(e) => update(i, { color: e.target.value })}
                  className="w-full h-10 bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] rounded-lg cursor-pointer"
                  title={a.color}
                />
              </div>
              <div>
                <button onClick={() => remove(i)} className={BTN_DANGER}>Apagar</button>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] flex items-center gap-2 select-none list-none">
                <span className="inline-block transition-transform group-open:rotate-90">▸</span>
                <span>Trocar ícone · atualmente <span style={{ color: a.color || '#2E5240' }}>{iconLabel(a.icon)}</span></span>
              </summary>
              <div className="pt-3">
                <IconPicker
                  value={a.icon || 'compass'}
                  onChange={(slug) => update(i, { icon: slug })}
                  slugs={ALL_ICON_SLUGS}
                  accent={a.color || '#2E5240'}
                  compact
                />
              </div>
            </details>
          </div>
        ))}

        {list.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[rgb(var(--acento-rgb)/0.15)] rounded-xl">
            <p className="text-sm text-[rgb(var(--texto-dim-rgb))] font-sans italic mb-4">Nenhuma área ainda.</p>
            <button onClick={add} className={BTN_PRIMARY}>+ Criar primeira área</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── Main ───────────────────── */
export default function TrilhasManager({ addToast, addLogEntry }) {
  const [tab, setTab] = useState('trilhas');
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [lists, setLists] = useState({ materials: [], posts: [], courses: [], glossario: [], cartographies: [], areas: DEFAULT_AREAS });

  useEffect(() => {
    setList(getTrilhas());
  }, []);

  useEffect(() => {
    const sync = () => {
      setLists({
        materials: getMaterials() || [],
        posts: readJsonSafe('raposa_admin_blog', []),
        courses: readJsonSafe('raposa_admin_courses', []),
        glossario: getGlossario() || [],
        cartographies: getCartographies() || [],
        areas: getAreas() || DEFAULT_AREAS,
      });
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('sitedata:changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sitedata:changed', sync);
    };
  }, []);

  const persist = (newList) => {
    setList(newList);
    setTrilhas(newList);
  };

  const handleSave = (trilha) => {
    // Garante slug
    const final = { ...trilha, slug: trilha.slug || slugify(trilha.name) || trilha.id };
    const exists = list.some((t) => t.id === final.id);
    const newList = exists ? list.map((t) => (t.id === final.id ? final : t)) : [...list, final];
    persist(newList);
    setEditing(null);
    addLogEntry?.(exists ? 'Trilha atualizada' : 'Trilha criada', final.name);
    addToast?.(exists ? 'Trilha atualizada' : 'Trilha criada', 'success');
  };

  const handleDelete = (id) => {
    if (!confirm('Apagar esta trilha?')) return;
    const t = list.find((x) => x.id === id);
    persist(list.filter((x) => x.id !== id));
    setEditing(null);
    addLogEntry?.('Trilha apagada', t?.name || id);
    addToast?.('Trilha apagada', 'success');
  };

  const handleMove = (id, delta) => {
    const idx = list.findIndex((t) => t.id === id);
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= list.length) return;
    const next = [...list];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    persist(next);
  };

  // Drag-and-drop entre trilhas no listing
  const [trilhaDragIdx, setTrilhaDragIdx] = useState(null);
  const [trilhaOverIdx, setTrilhaOverIdx] = useState(null);
  const onTrilhaDrop = (i) => {
    if (trilhaDragIdx === null || trilhaDragIdx === i) {
      setTrilhaDragIdx(null);
      setTrilhaOverIdx(null);
      return;
    }
    const next = [...list];
    const [moved] = next.splice(trilhaDragIdx, 1);
    next.splice(i, 0, moved);
    persist(next);
    setTrilhaDragIdx(null);
    setTrilhaOverIdx(null);
  };

  const editingTrilha = editing === 'new' ? EMPTY_TRILHA() : list.find((t) => t.id === editing);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Estudos · Trilhas</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">
            Cada trilha é um guia rico — etapas com texto, vídeos, materiais, cartografia e ensaios. Aparece em /estudos.
          </p>
        </div>
        {tab === 'trilhas' && !editing && (
          <button onClick={() => setEditing('new')} className={BTN_PRIMARY}>+ Nova trilha</button>
        )}
      </div>

      {/* Sub-tabs */}
      {!editing && (
        <div className="flex gap-1 border-b border-[rgb(var(--acento-rgb)/0.15)]">
          {[
            { id: 'trilhas', label: 'Trilhas' },
            { id: 'areas',   label: 'Áreas' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 font-mono text-[11px] tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? 'text-[rgb(var(--acento-rgb))] border-[rgb(var(--acento-rgb))]'
                  : 'text-[rgb(var(--texto-dim-rgb))] border-transparent hover:text-[rgb(var(--texto-forte-rgb))]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'areas' && !editing ? (
          <motion.div key="areas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AreasManager addToast={addToast} addLogEntry={addLogEntry} />
          </motion.div>
        ) : editing && editingTrilha ? (
          <motion.div key="editor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <TrilhaEditor
              trilha={editingTrilha}
              onChange={handleSave}
              onCancel={() => setEditing(null)}
              onDelete={editing !== 'new' ? () => handleDelete(editing) : null}
              lists={lists}
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {list.length === 0 && (
              <div className="text-center py-12 border border-dashed border-[rgb(var(--acento-rgb)/0.15)] rounded-xl">
                <p className="text-sm text-[rgb(var(--texto-dim-rgb))] font-sans italic mb-4">Nenhuma trilha ainda.</p>
                <button onClick={() => setEditing('new')} className={BTN_PRIMARY}>+ Criar primeira trilha</button>
              </div>
            )}
            {list.map((t, i) => {
              const migrated = migrateTrilhaBlocks(t);
              const slug = migrated.slug || migrated.id;
              const tagParts = [migrated.level, migrated.archetype, migrated.duration].filter(Boolean);
              const area = findArea(lists.areas, migrated.area);
              const trilhaExtra = isExtra(migrated);
              const trilhaHidden = migrated.hidden === true;
              const trilhaComingSoon = migrated.comingSoon === true;
              const visualColor = trilhaExtra ? EXTRA_COLOR : (area?.color || '#2E5240');
              const visualIcon = trilhaExtra ? EXTRA_ICON : migrated.icon;
              const isDragging = trilhaDragIdx === i;
              const isOver = trilhaOverIdx === i && trilhaDragIdx !== null && trilhaDragIdx !== i;
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => { setTrilhaDragIdx(i); try { e.dataTransfer.effectAllowed = 'move'; } catch {} }}
                  onDragOver={(e) => { e.preventDefault(); setTrilhaOverIdx(i); }}
                  onDragEnd={() => { setTrilhaDragIdx(null); setTrilhaOverIdx(null); }}
                  onDrop={(e) => { e.preventDefault(); onTrilhaDrop(i); }}
                  className={`${CARD} flex items-start justify-between gap-4 transition-all ${
                    isDragging ? 'opacity-40' : ''
                  } ${isOver ? 'ring-2 ring-[rgb(var(--acento-rgb))]' : ''} ${trilhaHidden ? 'opacity-50' : ''}`}
                  style={trilhaExtra ? { borderColor: `${EXTRA_COLOR}55`, background: `${EXTRA_COLOR}0a` } : undefined}
                >
                  <span className="cursor-grab text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] select-none pt-1 text-lg" title="Arraste para reordenar">⋮⋮</span>
                  <span
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full border shrink-0 mt-0.5"
                    style={{
                      color: visualColor,
                      borderColor: `${visualColor}55`,
                      background: `${visualColor}0d`,
                    }}
                    title={trilhaExtra ? 'Trilha extra' : iconLabel(migrated.icon)}
                  >
                    <TrilhaIcon name={visualIcon} size={26} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {trilhaHidden && (
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded"
                          style={{
                            color: '#F2EBDC',
                            background: '#9A7552',
                            border: '1px solid #9A7552',
                          }}
                          title="Oculta no site"
                        >
                          Oculta
                        </span>
                      )}
                      {trilhaComingSoon && (
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded"
                          style={{
                            color: '#F2EBDC',
                            background: '#962B24',
                            border: '1px solid #962B24',
                          }}
                          title="Aparece como 'Em breve' no site"
                        >
                          Em breve
                        </span>
                      )}
                      {trilhaExtra && (
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded"
                          style={{
                            color: EXTRA_COLOR,
                            background: `${EXTRA_COLOR}1a`,
                            border: `1px solid ${EXTRA_COLOR}55`,
                          }}
                        >
                          <TrilhaIcon name={EXTRA_ICON} size={12} />
                          Extra
                        </span>
                      )}
                      {area && (
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded"
                          style={{
                            color: area.color,
                            background: `${area.color}1a`,
                            border: `1px solid ${area.color}40`,
                          }}
                        >
                          <TrilhaIcon name={area.icon} size={12} />
                          {area.label}
                        </span>
                      )}
                      {tagParts.length > 0 && (
                        <span className="font-mono text-[10px] text-[rgb(var(--acento-rgb))] tracking-widest uppercase">{tagParts.join(' · ')}</span>
                      )}
                      <span className="font-mono text-[10px] text-[rgb(var(--texto-dim-rgb))] tracking-widest uppercase">
                        {migrated.stages.length} etapas · {migrated.stages.reduce((sum, s) => sum + (s.blocks?.length || 0), 0)} blocos
                      </span>
                      <span className="font-mono text-[9px] text-[rgb(var(--texto-dim-rgb))] tracking-widest">
                        /trilhas/<span className="text-[rgb(var(--acento-rgb))]">{slug}</span>
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-[rgb(var(--texto-forte-rgb))] leading-tight">{migrated.name}</h3>
                    <p className="text-xs text-[rgb(var(--texto-rgb))] mt-1 italic">{migrated.subtitle}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <div className="flex gap-1">
                      <button onClick={() => handleMove(t.id, -1)} disabled={i === 0} className="px-2 py-1 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] disabled:opacity-30">↑</button>
                      <button onClick={() => handleMove(t.id, 1)} disabled={i === list.length - 1} className="px-2 py-1 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] disabled:opacity-30">↓</button>
                    </div>
                    <button onClick={() => setEditing(t.id)} className={BTN_SECONDARY}>Editar</button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

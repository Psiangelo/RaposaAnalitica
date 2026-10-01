'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getGlossario, setGlossario,
  getGlossarioCategories, setGlossarioCategories, DEFAULT_GLOSSARIO_CATEGORIES, MASCARAS,
  getGlossarioPage, setGlossarioPage, DEFAULT_GLOSSARIO_PAGE,
  getMaterials,
} from '@/lib/sitedata';
import { LINK_KINDS } from '@/lib/linkResolver';
import MarkdownTextarea from './MarkdownTextarea';

const INPUT = 'w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-sm font-sans rounded-lg px-3 py-2 transition-colors';
const TEXTAREA = INPUT + ' resize-y';
const LABEL = 'block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2';
const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
const BTN_DANGER = 'px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-sans rounded-lg hover:bg-red-500/10 transition-colors';
const BTN_DANGER_INLINE = 'text-red-400/70 hover:text-red-400 text-xs px-1';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readJsonSafe(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * CommaListInput — campo de lista separada por vírgula (aliases, relacionados).
 *
 * ⚠️ NÃO voltar ao padrão `value={arr.join(', ')} onChange={split+trim+filter}`.
 * Ele torna impossível digitar a vírgula: no instante em que ela é digitada,
 * `split(',')` produz um item vazio no fim, `filter(Boolean)` o descarta, e o
 * `join(', ')` reconstrói a string SEM a vírgula — o caractere some do campo no
 * ato e o segundo item nunca começa. Bug relatado pelo Gabriel em 31/07/2026,
 * nos três campos deste editor.
 *
 * Aqui o que o usuário digitou vive em estado local e é o que aparece na tela;
 * o array só é derivado para o pai. Enquanto o campo está sendo editado, o
 * valor de fora não sobrescreve o texto. O blur normaliza a exibição.
 */
function CommaListInput({ value, onChange, ...props }) {
  const arr = Array.isArray(value) ? value : [];
  const joined = arr.join(', ');
  const [text, setText] = useState(joined);
  const editando = useRef(false);

  // ressincroniza ao trocar de verbete, mas nunca por cima de quem está digitando
  useEffect(() => {
    if (!editando.current) setText(joined);
  }, [joined]);

  return (
    <input
      {...props}
      value={text}
      onChange={(e) => {
        editando.current = true;
        setText(e.target.value);
        onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean));
      }}
      onBlur={() => {
        editando.current = false;
        setText(arr.join(', '));
      }}
    />
  );
}

const EMPTY_LINK = () => ({ kind: 'url', value: '', label: '' });

const EMPTY_TERMO = (categoria) => ({
  slug: `verbete-${Date.now().toString(36)}`,
  term: '',
  aliases: [],
  category: categoria || 'estrutura',
  short: '',
  full: '',
  related: { terms: [], materials: [] },
  links: [],
  hidden: false,
  autolink: true,
});

/* ───────────────────── LinkPicker (mesma essência do TrilhasManager) ───────────────────── */
function LinkPicker({ link, onChange, lists }) {
  const safeLink = link && link.kind ? link : { kind: 'url', value: '', label: '' };
  const update = (k, v) => onChange({ ...safeLink, [k]: v });

  const renderValue = () => {
    switch (safeLink.kind) {
      case 'material':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher material —</option>
            {lists.materials.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        );
      case 'blog':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher post —</option>
            {lists.posts.map((p) => (
              <option key={p.slug || p.id} value={p.slug || p.id}>{p.title}</option>
            ))}
          </select>
        );
      case 'course':
        return (
          <select value={safeLink.value || ''} onChange={(e) => update('value', e.target.value)} className={INPUT}>
            <option value="">— escolher curso —</option>
            {lists.courses.map((c) => (
              <option key={c.slug || c.id} value={c.slug || c.id}>{c.title}</option>
            ))}
          </select>
        );
      case 'youtube':
      case 'drive':
      case 'url':
        return (
          <input
            value={safeLink.value || ''}
            onChange={(e) => update('value', e.target.value)}
            placeholder={safeLink.kind === 'youtube' ? 'https://www.youtube.com/watch?v=...' : safeLink.kind === 'drive' ? 'https://drive.google.com/file/d/.../view' : 'https://...'}
            className={INPUT + ' font-mono text-xs'}
          />
        );
      case 'embed':
        return (
          <textarea
            value={safeLink.value || ''}
            onChange={(e) => update('value', e.target.value)}
            placeholder='<iframe src="..." ...></iframe>'
            rows={3}
            className={INPUT + ' font-mono text-xs resize-y'}
          />
        );
      default:
        return <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic font-sans py-2">Selecione um tipo.</p>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
        <select value={safeLink.kind} onChange={(e) => update('kind', e.target.value)} className={INPUT}>
          {LINK_KINDS.filter((k) => k.value !== 'none' && k.value !== 'glossario').map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        {renderValue()}
      </div>
      <input
        value={safeLink.label || ''}
        onChange={(e) => update('label', e.target.value)}
        placeholder="Rótulo do link (opcional)"
        className={INPUT + ' text-xs'}
      />
    </div>
  );
}

/* ───────────────────── Termo editor ───────────────────── */
function TermoEditor({ termo, categories, onChange, onCancel, onDelete, lists }) {
  const [draft, setDraft] = useState(termo);
  useEffect(() => setDraft(termo), [termo.slug]);

  const update = (k, v) => setDraft({ ...draft, [k]: v });

  const addLink = () => setDraft({ ...draft, links: [...(draft.links || []), EMPTY_LINK()] });
  const updateLink = (i, link) => {
    const links = [...(draft.links || [])];
    links[i] = link;
    setDraft({ ...draft, links });
  };
  const removeLink = (i) => setDraft({ ...draft, links: draft.links.filter((_, j) => j !== i) });

  return (
    <div className={CARD + ' space-y-4'}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-serif text-[rgb(var(--texto-forte-rgb))]">
          {termo.term ? `Editar: ${termo.term}` : 'Novo verbete'}
        </h3>
        <div className="flex gap-2">
          <button onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
          <button onClick={() => onChange(draft)} className={BTN_PRIMARY}>Salvar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Termo *</label>
          <input
            value={draft.term}
            onChange={(e) => {
              const term = e.target.value;
              const next = { ...draft, term };
              if (!draft.term || draft.slug.startsWith('verbete-')) next.slug = slugify(term) || draft.slug;
              setDraft(next);
            }}
            placeholder="Self"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Slug</label>
          <input
            value={draft.slug}
            onChange={(e) => update('slug', e.target.value)}
            onBlur={(e) => update('slug', slugify(e.target.value))}
            className={INPUT + ' font-mono text-xs'}
            placeholder="self"
          />
        </div>
        <div>
          <label className={LABEL}>Categoria</label>
          <select value={draft.category} onChange={(e) => update('category', e.target.value)} className={INPUT}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Máscara própria</label>
          <select value={draft.mascara || ''} onChange={(e) => update('mascara', e.target.value)} className={INPUT}>
            <option value="">a da categoria</option>
            {MASCARAS.map((m) => <option key={m.id} value={m.id}>{m.nome} · {m.sentido}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>Aliases (separados por vírgula — para busca)</label>
        <CommaListInput
          value={draft.aliases}
          onChange={(v) => update('aliases', v)}
          placeholder="si-mesmo, si mesmo"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Definição curta (1-2 linhas)</label>
        <textarea value={draft.short || ''} onChange={(e) => update('short', e.target.value)} rows={2} className={TEXTAREA} />
      </div>

      <div>
        <label className={LABEL}>Definição completa (markdown — bold, itálico, links, listas, citações)</label>
        <MarkdownTextarea
          value={draft.full || ''}
          onChange={(v) => update('full', v)}
          rows={8}
          placeholder="**Self** é, para *Jung*, o arquétipo da totalidade. Suporta [links](https://...) e listas."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={LABEL + ' mb-0'}>Links externos ({(draft.links || []).length})</label>
          <button onClick={addLink} className={BTN_SECONDARY}>+ Link</button>
        </div>
        <div className="space-y-3">
          {(draft.links || []).map((link, i) => (
            <div key={i} className="bg-[rgb(var(--fundo-rgb)/0.6)] border border-[rgb(var(--acento-rgb)/0.08)] rounded-lg p-3">
              <LinkPicker link={link} onChange={(l) => updateLink(i, l)} lists={lists} />
              <div className="flex justify-end mt-2">
                <button onClick={() => removeLink(i)} className={BTN_DANGER_INLINE}>Remover link</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Termos relacionados (slugs separados por vírgula)</label>
          <CommaListInput
            value={draft.related?.terms}
            onChange={(v) => update('related', { ...(draft.related || {}), terms: v })}
            placeholder="ego, individuacao"
            className={INPUT + ' font-mono text-xs'}
          />
        </div>
        <div>
          <label className={LABEL}>Materiais relacionados (ids)</label>
          <CommaListInput
            value={draft.related?.materials}
            onChange={(v) => update('related', { ...(draft.related || {}), materials: v })}
            placeholder="consciencia-complexo-ego"
            className={INPUT + ' font-mono text-xs'}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--acento-rgb)/0.08)]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!draft.hidden}
            onChange={(e) => update('hidden', e.target.checked)}
            className="w-4 h-4 accent-[rgb(var(--acento-rgb))]"
          />
          <span className="text-xs text-[rgb(var(--texto-rgb))] font-sans">Ocultar do público</span>
        </label>
        {onDelete && (
          <button onClick={onDelete} className={BTN_DANGER}>Apagar verbete</button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── Sub-tab: Verbetes ───────────────────── */
function VerbetesTab({ list, setList, categories, lists, addToast, addLogEntry }) {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return list.filter((t) => {
      if (filter !== 'todas' && t.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${t.term} ${t.short} ${(t.aliases || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [list, filter, search]);

  const persist = (newList) => {
    setList(newList);
    setGlossario(newList);
  };

  const handleSave = (termo) => {
    const exists = list.some((t) => t.slug === termo.slug);
    const newList = exists
      ? list.map((t) => (t.slug === termo.slug ? termo : t))
      : [...list, termo];
    persist(newList);
    setEditing(null);
    addLogEntry?.(exists ? 'Verbete atualizado' : 'Verbete criado', termo.term);
    addToast?.(exists ? 'Verbete atualizado' : 'Verbete criado', 'success');
  };

  const handleDelete = (slug) => {
    if (!confirm('Apagar este verbete?')) return;
    const t = list.find((x) => x.slug === slug);
    persist(list.filter((x) => x.slug !== slug));
    setEditing(null);
    addLogEntry?.('Verbete apagado', t?.term || slug);
    addToast?.('Verbete apagado', 'success');
  };

  const toggleHidden = (slug) => {
    persist(list.map((t) => (t.slug === slug ? { ...t, hidden: !t.hidden } : t)));
  };

  // Um clique, sem entrar em modo de edição — liga/desliga se este verbete
  // vira link sozinho nos ensaios. Diferente de `hidden`: aqui o verbete
  // continua com página própria, no índice e no sitemap; só deixa de ser
  // autolinkado automaticamente (a marcação manual continua funcionando).
  const toggleAutolink = (slug) => {
    persist(list.map((t) => (t.slug === slug ? { ...t, autolink: t.autolink === false } : t)));
  };

  const editingTermo = editing === 'new'
    ? EMPTY_TERMO(categories[0]?.slug)
    : list.find((t) => t.slug === editing);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Verbetes</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">
            {list.length} no total · {list.filter((t) => !t.hidden).length} visíveis · {list.filter((t) => t.autolink !== false).length} viram link sozinhos nos ensaios
          </p>
          <p className="text-[10px] text-[rgb(var(--texto-dim-rgb)/0.7)] font-sans mt-0.5">
            "Ocultar" tira o verbete do site inteiro. "Vira link sozinho" só decide se ele é reconhecido automaticamente dentro dos ensaios — desligado, o verbete continua com página própria e só vira link onde você marcar o trecho à mão.
          </p>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')} className={BTN_PRIMARY}>+ Novo verbete</button>
        )}
      </div>

      {editing && editingTermo ? (
        <TermoEditor
          termo={editingTermo}
          categories={categories}
          onChange={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={editing !== 'new' ? () => handleDelete(editing) : null}
          lists={lists}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className={INPUT + ' max-w-xs'}
            />
            <button
              onClick={() => setFilter('todas')}
              className={`px-3 py-2 text-xs font-sans rounded-lg transition-all ${filter === 'todas' ? 'bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] font-semibold' : 'bg-[rgb(var(--cartao-rgb))] text-[rgb(var(--texto-dim-rgb))]'}`}
            >Todas</button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setFilter(c.slug)}
                className={`px-3 py-2 text-xs font-sans rounded-lg transition-all ${filter === c.slug ? 'bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] font-semibold' : 'bg-[rgb(var(--cartao-rgb))] text-[rgb(var(--texto-dim-rgb))]'}`}
              >{c.label}</button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((t) => (
              <div key={t.slug} className={CARD + ' flex items-start justify-between gap-3'}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-serif text-base text-[rgb(var(--texto-forte-rgb))]">{t.term}</h3>
                    <span className="font-mono text-[9px] tracking-widest uppercase text-[rgb(var(--texto-dim-rgb))]">{t.category}</span>
                    {t.hidden && <span className="text-[9px] uppercase tracking-widest text-yellow-500 border border-yellow-500/30 px-1.5 py-0.5 rounded">oculto</span>}
                    {t.autolink === false && (
                      <span
                        className="text-[9px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] border border-[rgb(var(--acento-rgb)/0.2)] px-1.5 py-0.5 rounded"
                        title="Só vira link nos ensaios onde for marcado à mão"
                      >
                        só à mão
                      </span>
                    )}
                    {(t.links || []).length > 0 && (
                      <span className="text-[9px] uppercase tracking-widest text-[rgb(var(--acento-rgb))] border border-[rgb(var(--acento-rgb)/0.3)] px-1.5 py-0.5 rounded">
                        {t.links.length} link{t.links.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[rgb(var(--texto-dim-rgb))] line-clamp-2">{t.short}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleAutolink(t.slug)}
                    className={
                      'px-3 py-1.5 text-xs font-sans rounded-lg transition-colors border ' +
                      (t.autolink === false
                        ? 'border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-dim-rgb))] hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))]'
                        : 'border-[rgb(var(--acento-rgb)/0.5)] text-[rgb(var(--acento-rgb))] bg-[rgb(var(--acento-rgb)/0.1)]')
                    }
                    title="Decide se este termo vira link sozinho quando aparecer em qualquer ensaio. Não afeta a marcação manual nem a página do verbete."
                  >
                    {t.autolink === false ? 'Vira link só à mão' : 'Vira link sozinho'}
                  </button>
                  <button onClick={() => toggleHidden(t.slug)} className={BTN_SECONDARY} title={t.hidden ? 'Mostrar' : 'Ocultar'}>
                    {t.hidden ? 'Mostrar' : 'Ocultar'}
                  </button>
                  <button onClick={() => setEditing(t.slug)} className={BTN_SECONDARY}>Editar</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-[rgb(var(--texto-dim-rgb))] italic py-8">Nenhum verbete com esses filtros.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────────── Sub-tab: Categorias ───────────────────── */
function CategoriesTab({ categories, setCategoriesState, addToast, addLogEntry }) {
  const [dirty, setDirty] = useState(false);

  const update = (idx, key, value) => {
    setCategoriesState(categories.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
    setDirty(true);
  };
  const move = (idx, dir) => {
    const next = [...categories];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setCategoriesState(next.map((c, i) => ({ ...c, ordem: i })));
    setDirty(true);
  };
  const remove = (idx) => {
    if (!confirm(`Remover categoria "${categories[idx].label}"?`)) return;
    setCategoriesState(categories.filter((_, i) => i !== idx).map((c, i) => ({ ...c, ordem: i })));
    setDirty(true);
  };
  const add = () => {
    setCategoriesState([...categories, { slug: `cat-${Date.now()}`, label: 'Nova categoria', tone: 'accent', ordem: categories.length }]);
    setDirty(true);
  };
  const persist = () => {
    const cleaned = categories.map((c, i) => ({
      slug: slugify(c.slug) || `cat-${i}`,
      label: c.label || 'Sem nome',
      tone: c.tone || 'accent',
      mascara: c.mascara || 'shiro',
      ordem: i,
    }));
    setGlossarioCategories(cleaned);
    setCategoriesState(cleaned);
    setDirty(false);
    addLogEntry?.('Categorias do glossário salvas', `${cleaned.length} itens`);
    addToast?.('Categorias salvas', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Categorias do glossário</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">Agrupam verbetes na listagem pública.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={add} className={BTN_SECONDARY}>+ Nova categoria</button>
          <button onClick={persist} disabled={!dirty} className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}>Salvar</button>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((c, i) => (
          <div key={`${c.slug}-${i}`} className={CARD}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={LABEL}>Nome</label>
                <input value={c.label} onChange={(e) => update(i, 'label', e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Slug</label>
                <input
                  value={c.slug}
                  onChange={(e) => update(i, 'slug', e.target.value)}
                  onBlur={(e) => update(i, 'slug', slugify(e.target.value))}
                  className={INPUT + ' font-mono text-xs'}
                />
              </div>
              <div>
                <label className={LABEL}>Máscara da família</label>
                <select value={c.mascara || 'shiro'} onChange={(e) => update(i, 'mascara', e.target.value)} className={INPUT}>
                  {MASCARAS.map((m) => <option key={m.id} value={m.id}>{m.nome} · {m.sentido}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[rgb(var(--acento-rgb)/0.08)]">
              <button onClick={() => move(i, -1)} disabled={i === 0} className={BTN_SECONDARY + ' disabled:opacity-30'}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className={BTN_SECONDARY + ' disabled:opacity-30'}>↓</button>
              <button onClick={() => remove(i)} className={BTN_DANGER}>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── Sub-tab: Página ───────────────────── */
function PageTab({ addToast, addLogEntry }) {
  const [data, setData] = useState(DEFAULT_GLOSSARIO_PAGE);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setData(getGlossarioPage()); }, []);

  const update = (block, key, value) => {
    setData((prev) => ({ ...prev, [block]: { ...prev[block], [key]: value } }));
    setDirty(true);
  };

  const persist = () => {
    setGlossarioPage(data);
    setDirty(false);
    addLogEntry?.('Página do glossário salva');
    addToast?.('Página do glossário salva', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Textos da página /glossario</h2>
        <button onClick={persist} disabled={!dirty} className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}>Salvar</button>
      </div>

      <div className={CARD}>
        <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest mb-4">Hero</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={LABEL}>Eyebrow</label>
            <input value={data.hero.eyebrow || ''} onChange={(e) => update('hero', 'eyebrow', e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Título</label>
            <input value={data.hero.title || ''} onChange={(e) => update('hero', 'title', e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Ênfase (itálico)</label>
            <input value={data.hero.emphasis || ''} onChange={(e) => update('hero', 'emphasis', e.target.value)} className={INPUT} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Kicker</label>
            <input value={data.hero.kicker || ''} onChange={(e) => update('hero', 'kicker', e.target.value)} className={INPUT} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Lead (descrição)</label>
            <textarea value={data.hero.lead || ''} onChange={(e) => update('hero', 'lead', e.target.value)} rows={3} className={TEXTAREA} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Wrapper com sub-tabs ───────────────────── */
export default function GlossarioManager({ addToast, addLogEntry }) {
  const [subTab, setSubTab] = useState('verbetes');
  const [list, setList] = useState([]);
  const [categories, setCategoriesState] = useState(DEFAULT_GLOSSARIO_CATEGORIES);
  const [lists, setLists] = useState({ materials: [], posts: [], courses: [] });

  useEffect(() => {
    const sync = () => {
      setList(getGlossario());
      setCategoriesState(getGlossarioCategories());
      setLists({
        materials: getMaterials() || [],
        posts: readJsonSafe('raposa_admin_blog', []),
        courses: readJsonSafe('raposa_admin_courses', []),
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

  const subTabs = [
    { id: 'verbetes', label: 'Verbetes' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'pagina', label: 'Página /verbetes' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap gap-1 mb-6 border-b border-[rgb(var(--acento-rgb)/0.15)]">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2.5 text-xs font-sans uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              subTab === t.id
                ? 'border-[rgb(var(--acento-rgb))] text-[rgb(var(--acento-rgb))]'
                : 'border-transparent text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-rgb))]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'verbetes' && (
          <motion.div key="verbetes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VerbetesTab
              list={list}
              setList={setList}
              categories={categories}
              lists={lists}
              addToast={addToast}
              addLogEntry={addLogEntry}
            />
          </motion.div>
        )}
        {subTab === 'categorias' && (
          <motion.div key="cats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CategoriesTab
              categories={categories}
              setCategoriesState={setCategoriesState}
              addToast={addToast}
              addLogEntry={addLogEntry}
            />
          </motion.div>
        )}
        {subTab === 'pagina' && (
          <motion.div key="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PageTab addToast={addToast} addLogEntry={addLogEntry} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

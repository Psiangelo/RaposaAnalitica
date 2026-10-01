'use client';
import { resolveImageSrc } from '@/lib/basepath';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlogEditor from './BlogEditor';
import FeaturedImagePicker from './FeaturedImagePicker';
import { getBlogAuthorCta, setBlogAuthorCta, DEFAULT_BLOG_AUTHOR_CTA } from '@/lib/sitedata';

// ─── Constants ──────────────────────────────────────────────────────
const STORAGE_KEY = 'raposa_admin_blog';
const SERIES_STORAGE_KEY = 'raposa_admin_blog_series';

const INPUT_CLASS =
  'w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] rounded-lg px-4 py-3 text-sm text-[rgb(var(--texto-forte-rgb))] font-sans focus:outline-none focus:border-[rgb(var(--acento-rgb))] transition-colors';
const LABEL_CLASS = 'block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2';
const CARD_CLASS = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
const BTN_DANGER = 'px-3 py-1.5 border border-red-900/30 text-red-400 text-xs font-sans rounded-lg hover:border-red-600 hover:text-red-300 transition-colors';
const BTN_ICON = 'p-1.5 text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors rounded';

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: '#56655D', bg: 'rgb(var(--texto-dim-rgb)/0.15)', border: 'rgb(var(--texto-dim-rgb)/0.3)' },
  published: { label: 'Publicado', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
  scheduled: { label: 'Agendado', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
};

// ─── Helpers ────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function calculateReadingTime(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractHeadings(html) {
  if (!html) return [];
  const regex = /<h([1-4])[^>]*>(.*?)<\/h[1-4]>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text) {
      const id = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ level: parseInt(match[1]), text, id });
    }
  }
  return headings;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

// ─── Reusable Components ────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-[rgb(var(--acento-rgb))]' : 'bg-[rgb(var(--linha-rgb))]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-[rgb(var(--texto-forte-rgb))] rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-serif text-[rgb(var(--texto-forte-rgb))] mb-2">{title}</h3>
        <p className="text-sm text-[rgb(var(--texto-rgb))] font-sans mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-sans text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-rgb))] transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-sans font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Confirmar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Post List View ─────────────────────────────────────────────────
function PostList({
  posts, seriesList, onEdit, onDelete, onDuplicate, onTogglePublish, onTogglePin,
  onBatchPublish, onBatchUnpublish, onBatchDelete,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchAction, setBatchAction] = useState(null);

  const allTags = useMemo(() => {
    const tags = new Set();
    posts.forEach((p) => (p.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesTag = !tagFilter || (p.tags || []).includes(tagFilter);
      const matchesSeries = !seriesFilter || p.seriesId === seriesFilter;
      const matchesSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.content_html || '').replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesTag && matchesSeries && matchesSearch;
    }).sort((a, b) => {
      // Pinned first, then by date
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
  }, [posts, statusFilter, tagFilter, seriesFilter, searchQuery]);

  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    published: posts.filter((p) => p.status === 'published').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
  };

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const executeBatch = () => {
    const ids = Array.from(selectedIds);
    if (batchAction === 'publish') onBatchPublish(ids);
    else if (batchAction === 'unpublish') onBatchUnpublish(ids);
    else if (batchAction === 'delete') onBatchDelete(ids);
    setSelectedIds(new Set());
    setBatchAction(null);
  };

  return (
    <>
      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no titulo, resumo e conteudo..."
            className={INPUT_CLASS + ' sm:max-w-sm'} />
          <div className="flex gap-2 items-center flex-wrap">
            {Object.entries({ all: 'Todos', draft: 'Rascunhos', published: 'Publicados', scheduled: 'Agendados' }).map(([key, label]) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`px-3 py-2 text-xs font-sans rounded-lg transition-all flex items-center gap-1.5 ${
                  statusFilter === key ? 'bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] font-semibold' : 'bg-[rgb(var(--cartao-rgb))] text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-rgb))]'
                }`}>
                {label} <span className={`text-[10px] ${statusFilter === key ? 'text-[rgb(var(--fundo-rgb)/0.6)]' : 'text-[rgb(var(--texto-dim-rgb)/0.6)]'}`}>{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {allTags.length > 0 && (
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}
              className="bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] rounded-lg px-3 py-1.5 text-xs text-[rgb(var(--texto-rgb))] font-sans focus:outline-none focus:border-[rgb(var(--acento-rgb))]">
              <option value="">Todas as tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          {seriesList.length > 0 && (
            <select value={seriesFilter} onChange={(e) => setSeriesFilter(e.target.value)}
              className="bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] rounded-lg px-3 py-1.5 text-xs text-[rgb(var(--texto-rgb))] font-sans focus:outline-none focus:border-[rgb(var(--acento-rgb))]">
              <option value="">Todas as series</option>
              {seriesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <label className="flex items-center gap-2 ml-auto cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
              className="w-4 h-4 accent-[rgb(var(--acento-rgb))] bg-[rgb(var(--fundo-rgb))] rounded" />
            <span className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans">Selecionar todos</span>
          </label>
        </div>
      </div>

      <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mb-4">
        {filtered.length} de {posts.length} posts
      </p>

      {/* Post list */}
      <div className="space-y-3">
        {filtered.map((post) => {
          const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
          const readTime = calculateReadingTime(post.content_html);
          const series = seriesList.find((s) => s.id === post.seriesId);
          const isSelected = selectedIds.has(post.id);
          return (
            <motion.div key={post.id} layout className={`${CARD_CLASS} ${isSelected ? 'ring-1 ring-[rgb(var(--acento-rgb)/0.5)]' : ''} ${post.pinned ? 'border-l-2 border-l-[rgb(var(--acento-rgb))]' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(post.id)}
                    className="w-4 h-4 accent-[rgb(var(--acento-rgb))] mt-1 shrink-0 cursor-pointer" />
                  {post.featured_image && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[rgb(var(--acento-rgb)/0.1)]">
                      <img src={resolveImageSrc(post.featured_image)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.pinned && <span className="text-[10px] text-[rgb(var(--acento-rgb))] font-sans" title="Fixado">{'\u{1F4CC}'}</span>}
                      <h3 className="text-[rgb(var(--texto-forte-rgb))] font-serif text-base cursor-pointer hover:text-[rgb(var(--acento-rgb))] transition-colors" onClick={() => onEdit(post.id)}>
                        {post.title || 'Sem titulo'}
                      </h3>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-sans"
                        style={{ color: status.color, backgroundColor: status.bg, border: `1px solid ${status.border}` }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans">
                      {formatDate(post.updated_at)} &middot; {readTime} min de leitura
                      {post.author && ` \u00B7 ${post.author}`}
                      {series && <span className="text-[rgb(var(--acento-rgb))]"> &middot; {series.name}</span>}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-sans bg-[rgb(var(--acento-rgb)/0.1)] text-[rgb(var(--acento-rgb)/0.8)] rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button onClick={() => onTogglePin(post.id)} className={BTN_ICON} title={post.pinned ? 'Desafixar' : 'Fixar no topo'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={post.pinned ? '#2E5240' : 'none'} stroke={post.pinned ? '#2E5240' : 'currentColor'} strokeWidth="2">
                      <path d="M12 2l3 9h9l-7.5 5.5L19 22l-7-5-7 5 2.5-5.5L0 11h9z" />
                    </svg>
                  </button>
                  <button onClick={() => onTogglePublish(post.id)}
                    className={post.status === 'published' ? BTN_SECONDARY : BTN_SECONDARY + ' !text-green-400 !border-green-400/30'}>
                    {post.status === 'published' ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button onClick={() => onEdit(post.id)} className={BTN_SECONDARY}>Editar</button>
                  <button onClick={() => onDuplicate(post.id)} className={BTN_SECONDARY}>Duplicar</button>
                  <button onClick={() => setDeleteConfirm(post.id)} className={BTN_DANGER}>Excluir</button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[rgb(var(--texto-sutil-rgb))] font-sans">
              {posts.length === 0 ? 'Nenhum post ainda. Crie seu primeiro!' : 'Nenhum post encontrado.'}
            </p>
          </div>
        )}
      </div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-[70px] sm:bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.25)] rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 flex-wrap justify-center">
            <span className="text-sm text-[rgb(var(--texto-forte-rgb))] font-sans font-medium">{selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}</span>
            <div className="w-px h-5 bg-[rgb(var(--acento-rgb)/0.15)]" />
            <button onClick={() => setBatchAction('publish')} className={BTN_SECONDARY + ' !text-green-400 !border-green-400/30'}>Publicar</button>
            <button onClick={() => setBatchAction('unpublish')} className={BTN_SECONDARY}>Despublicar</button>
            <button onClick={() => setBatchAction('delete')} className={BTN_DANGER}>Excluir</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-rgb))] font-sans transition-colors">Limpar</button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal open={!!deleteConfirm} title="Excluir post"
        message="Tem certeza que deseja excluir este post?"
        onConfirm={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
        onCancel={() => setDeleteConfirm(null)} />

      <ConfirmModal open={!!batchAction} title={`${batchAction === 'delete' ? 'Excluir' : batchAction === 'publish' ? 'Publicar' : 'Despublicar'} ${selectedIds.size} posts`}
        message={`Tem certeza que deseja ${batchAction === 'delete' ? 'excluir' : batchAction === 'publish' ? 'publicar' : 'despublicar'} ${selectedIds.size} post(s)?`}
        onConfirm={executeBatch}
        onCancel={() => setBatchAction(null)} />
    </>
  );
}

// ─── Series Manager (inline) ────────────────────────────────────────
function SeriesManager({ seriesList, setSeriesList, addToast }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const addSeries = () => {
    if (!newName.trim()) return;
    setSeriesList((prev) => [...prev, { id: generateId(), name: newName.trim() }]);
    setNewName('');
    addToast?.('Serie criada', 'success');
  };

  const saveName = (id) => {
    setSeriesList((prev) => prev.map((s) => (s.id === id ? { ...s, name: editName } : s)));
    setEditId(null);
    addToast?.('Serie atualizada', 'success');
  };

  const deleteSeries = (id) => {
    setSeriesList((prev) => prev.filter((s) => s.id !== id));
    addToast?.('Serie removida', 'success');
  };

  return (
    <div className={CARD_CLASS + ' mb-6'}>
      <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Series / Colecoes</h3>
      <div className="flex gap-2 mb-3">
        <input value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSeries()}
          placeholder="Nome da nova serie..." className={INPUT_CLASS + ' text-xs'} />
        <button onClick={addSeries} className={BTN_PRIMARY + ' shrink-0 text-xs'}>+ Serie</button>
      </div>
      {seriesList.length > 0 && (
        <div className="space-y-2">
          {seriesList.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 py-1.5">
              {editId === s.id ? (
                <div className="flex gap-2 flex-1">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName(s.id)}
                    className={INPUT_CLASS + ' text-xs'} autoFocus />
                  <button onClick={() => saveName(s.id)} className={BTN_PRIMARY + ' text-xs shrink-0'}>Salvar</button>
                  <button onClick={() => setEditId(null)} className={BTN_SECONDARY + ' shrink-0'}>Cancelar</button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-[rgb(var(--texto-rgb))] font-sans">{s.name}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditId(s.id); setEditName(s.name); }} className={BTN_SECONDARY}>Editar</button>
                    <button onClick={() => deleteSeries(s.id)} className={BTN_DANGER}>Excluir</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthorBoxManager({ addToast }) {
  const [data, setData] = useState(DEFAULT_BLOG_AUTHOR_CTA);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setData(getBlogAuthorCta());
  }, []);

  const update = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = () => {
    setBlogAuthorCta(data);
    setDirty(false);
    addToast?.('CTA da caixa de autor salvo', 'success');
  };

  return (
    <div className={CARD_CLASS + ' mb-6'}>
      <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-1">
        Caixa de autor — CTA
      </h3>
      <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">
        Aparece no fim de cada post, com foto + nome + bio (editáveis em Bio / Linktree) e este botão.
        Pra esconder a caixa inteira, use Visibilidade → Blog.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className={LABEL_CLASS}>Texto do botão</label>
          <input value={data.label} onChange={(e) => update('label', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Destino (link interno ou URL)</label>
          <input value={data.href} onChange={(e) => update('href', e.target.value)} className={INPUT_CLASS} placeholder="/psicoterapia-analitica" />
        </div>
      </div>
      <button onClick={save} disabled={!dirty} className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}>
        Salvar
      </button>
    </div>
  );
}

// ─── Post Editor View ───────────────────────────────────────────────
function PostEditor({ post, seriesList, onSave, onCancel }) {
  const [data, setData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || null,
    content_html: post?.content_html || '',
    featured_image: post?.featured_image || '',
    featured_image_alt: post?.featured_image_alt || '',
    featured_cover: post?.featured_cover || '',
    featured_cover_alt: post?.featured_cover_alt || '',
    author: post?.author || 'Angelo',
    seo_title: post?.seo_title || '',
    seo_description: post?.seo_description || '',
    tags: (post?.tags || []).join(', '),
    status: post?.status || 'draft',
    pinned: post?.pinned || false,
    seriesId: post?.seriesId || '',
    seriesOrder: post?.seriesOrder || 0,
    scheduled_at: post?.scheduled_at || '',
  });

  const [showSeo, setShowSeo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!post?.slug);
  const autosaveTimer = useRef(null);
  const [lastSaved, setLastSaved] = useState(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const readTime = useMemo(() => calculateReadingTime(data.content_html), [data.content_html]);
  const headings = useMemo(() => extractHeadings(data.content_html), [data.content_html]);

  useEffect(() => {
    if (!slugEdited && data.title) {
      setData((prev) => ({ ...prev, slug: generateSlug(data.title) }));
    }
  }, [data.title, slugEdited]);

  // Autosave every 30s
  useEffect(() => {
    autosaveTimer.current = setInterval(() => {
      doSave(true);
    }, 30000);
    return () => clearInterval(autosaveTimer.current);
  }, []);

  const doSave = useCallback((isAutosave = false) => {
    const d = dataRef.current;
    const tags = d.tags.split(',').map((t) => t.trim()).filter(Boolean);
    onSave({
      title: d.title,
      slug: d.slug || generateSlug(d.title || 'novo-post'),
      excerpt: d.excerpt,
      content: d.content,
      content_html: d.content_html,
      featured_image: d.featured_image,
      featured_image_alt: d.featured_image_alt,
      featured_cover: d.featured_cover,
      featured_cover_alt: d.featured_cover_alt,
      author: d.author,
      seo_title: d.seo_title,
      seo_description: d.seo_description,
      tags,
      status: d.status,
      pinned: d.pinned,
      seriesId: d.seriesId,
      seriesOrder: d.seriesOrder,
      scheduled_at: d.scheduled_at,
    }, isAutosave);
    if (isAutosave) setLastSaved(new Date());
  }, [onSave]);

  const handleEditorChange = useCallback(({ json, html }) => {
    setData((prev) => ({ ...prev, content: json, content_html: html }));
  }, []);

  const handlePublish = () => {
    setData((prev) => ({ ...prev, status: 'published' }));
    setTimeout(() => doSave(), 50);
  };

  const handleSchedule = () => {
    if (!data.scheduled_at) return;
    setData((prev) => ({ ...prev, status: 'scheduled' }));
    setTimeout(() => doSave(), 50);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={onCancel} className="flex items-center gap-2 text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-rgb))] font-sans transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
          Voltar
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {lastSaved && <span className="text-[10px] text-green-400/60 font-sans">Autosalvo {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
          <span className="text-[10px] text-[rgb(var(--texto-dim-rgb))] font-sans">{readTime} min leitura</span>
          <button onClick={() => setShowPreview(!showPreview)} className={BTN_SECONDARY}>
            {showPreview ? 'Editar' : 'Preview'}
          </button>
          <button onClick={() => doSave()} className={BTN_SECONDARY}>Salvar</button>
          {data.status !== 'published' && (
            <button onClick={handlePublish} className={BTN_PRIMARY}>Publicar</button>
          )}
        </div>
      </div>

      {showPreview ? (
        <div className={CARD_CLASS}>
          <div className="max-w-[760px] mx-auto">
            {data.featured_image && (
              <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8 border border-[rgb(var(--acento-rgb)/0.1)]">
                <img src={resolveImageSrc(data.featured_image)} alt={data.featured_image_alt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <h1 className="font-serif text-3xl text-[rgb(var(--texto-forte-rgb))] mb-2">{data.title || 'Sem titulo'}</h1>
            <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mb-6">{readTime} min de leitura</p>
            {headings.length > 2 && (
              <nav className="bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-5 mb-8">
                <p className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Neste artigo</p>
                <ul className="space-y-1.5">
                  {headings.map((h, i) => (
                    <li key={i} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                      <span className="text-sm text-[rgb(var(--texto-rgb))] font-sans hover:text-[rgb(var(--acento-rgb))] cursor-pointer">{h.text}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: data.content_html }} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Titulo do post..."
              className="w-full bg-transparent border-none text-2xl font-serif text-[rgb(var(--texto-forte-rgb))] placeholder:text-[rgb(var(--texto-sutil-rgb))] focus:outline-none" />
            <BlogEditor content={data.content} onChange={handleEditorChange} placeholder="Comece a escrever..." />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className={CARD_CLASS}>
              <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Publicacao</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--texto-rgb))] font-sans">Status</span>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-sans"
                    style={{ color: STATUS_CONFIG[data.status]?.color, backgroundColor: STATUS_CONFIG[data.status]?.bg, border: `1px solid ${STATUS_CONFIG[data.status]?.border}` }}>
                    {STATUS_CONFIG[data.status]?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--texto-rgb))] font-sans">Fixar no topo</span>
                  <Toggle enabled={data.pinned} onChange={(v) => setData({ ...data, pinned: v })} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Agendar</label>
                  <input type="datetime-local" value={data.scheduled_at}
                    onChange={(e) => setData({ ...data, scheduled_at: e.target.value })}
                    className={INPUT_CLASS + ' text-xs'} />
                  {data.scheduled_at && data.status !== 'published' && (
                    <button onClick={handleSchedule} className={BTN_SECONDARY + ' mt-2 w-full text-center !text-blue-400 !border-blue-400/30'}>Agendar</button>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image (horizontal) — usada no hero da publicação aberta e no OG */}
            <div className={CARD_CLASS}>
              <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3 flex items-center gap-2">
                Imagem horizontal
                <span className="text-[9px] text-[rgb(var(--acento-rgb)/0.8)] normal-case tracking-normal italic">hero do post + compartilhamento</span>
              </h3>
              <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] mb-3 font-sans italic">
                Formato paisagem (16:9). Aparece quando alguém abre a publicação e no preview ao compartilhar o link.
              </p>
              <FeaturedImagePicker
                value={data.featured_image || ''}
                alt={data.featured_image_alt || ''}
                onChange={(v) => setData((prev) => ({ ...prev, featured_image: v }))}
                onAltChange={(v) => setData((prev) => ({ ...prev, featured_image_alt: v }))}
              />
            </div>

            {/* Featured Cover (vertical) — usada nos cards da lista /blog */}
            <div className={CARD_CLASS}>
              <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3 flex items-center gap-2">
                Capa vertical
                <span className="text-[9px] text-[rgb(var(--acento-rgb)/0.8)] normal-case tracking-normal italic">cards da lista /blog</span>
              </h3>
              <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] mb-3 font-sans italic">
                Formato 9:16 (mesmo de Reels/Story do Instagram — ex. 1080×1920). Otimizado pra mobile e vira a cara da lista. Se vazia, os cards usam a imagem horizontal recortada.
              </p>
              <FeaturedImagePicker
                value={data.featured_cover || ''}
                alt={data.featured_cover_alt || ''}
                onChange={(v) => setData((prev) => ({ ...prev, featured_cover: v }))}
                onAltChange={(v) => setData((prev) => ({ ...prev, featured_cover_alt: v }))}
              />
            </div>

            {/* Dica sobre destaque no título */}
            <div className={CARD_CLASS + ' border-[rgb(var(--acento-rgb)/0.2)] bg-[rgb(var(--acento-rgb)/0.03)]'}>
              <p className="text-[11px] text-[rgb(var(--texto-rgb))] font-sans leading-relaxed">
                <span className="text-[rgb(var(--acento-rgb))]">Dica:</span> marque partes do título com <code className="bg-[rgb(var(--fundo-rgb))] px-1.5 py-0.5 rounded text-[rgb(var(--acento-rgb))] font-mono">*palavra*</code> pra virar dourado (italic). Ex.: <code className="bg-[rgb(var(--fundo-rgb))] px-1.5 py-0.5 rounded text-[rgb(var(--texto-rgb))] font-mono">O que é *inconsciente* em Jung?</code>
              </p>
            </div>

            {/* Excerpt */}
            <div className={CARD_CLASS}>
              <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Resumo</h3>
              <textarea value={data.excerpt} onChange={(e) => setData({ ...data, excerpt: e.target.value })}
                placeholder="Descricao para os cards..." rows={3} className={INPUT_CLASS + ' resize-y text-xs'} />
              <p className="text-[10px] text-[rgb(var(--texto-sutil-rgb))] font-sans mt-1.5 leading-relaxed">
                Aparece nos cards do blog e é a descrição usada quando o link do post é compartilhado (WhatsApp, X, Threads etc.). Sem resumo, a prévia mostra um texto genérico do site.
              </p>
            </div>

            {/* Tags */}
            <div className={CARD_CLASS}>
              <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Tags</h3>
              <input value={data.tags} onChange={(e) => setData({ ...data, tags: e.target.value })}
                placeholder="Psicologia, Jung, Clinica..." className={INPUT_CLASS + ' text-xs'} />
              {data.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] font-sans bg-[rgb(var(--acento-rgb)/0.15)] text-[rgb(var(--acento-rgb))] rounded-full border border-[rgb(var(--acento-rgb)/0.2)]">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Series */}
            {seriesList.length > 0 && (
              <div className={CARD_CLASS}>
                <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Serie</h3>
                <select value={data.seriesId} onChange={(e) => setData({ ...data, seriesId: e.target.value })}
                  className={INPUT_CLASS + ' text-xs'}>
                  <option value="">Nenhuma serie</option>
                  {seriesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {data.seriesId && (
                  <div className="mt-2">
                    <label className={LABEL_CLASS}>Ordem na serie</label>
                    <input type="number" min="0" value={data.seriesOrder}
                      onChange={(e) => setData({ ...data, seriesOrder: parseInt(e.target.value) || 0 })}
                      className={INPUT_CLASS + ' text-xs'} />
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className={CARD_CLASS}>
              <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-3">Detalhes</h3>
              <div className="space-y-3">
                <div>
                  <label className={LABEL_CLASS}>Autor</label>
                  <input value={data.author} onChange={(e) => setData({ ...data, author: e.target.value })} className={INPUT_CLASS + ' text-xs'} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Slug (URL)</label>
                  <input value={data.slug} onChange={(e) => { setData({ ...data, slug: e.target.value }); setSlugEdited(true); }}
                    className={INPUT_CLASS + ' text-xs font-mono'} />
                </div>
                <div className="text-[10px] text-[rgb(var(--texto-sutil-rgb))] font-sans">
                  Tempo de leitura: ~{readTime} min &middot; {headings.length} headings
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className={CARD_CLASS}>
              <button onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full">
                <h3 className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans">SEO</h3>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                  className={`text-[rgb(var(--texto-dim-rgb))] transition-transform ${showSeo ? 'rotate-180' : ''}`}><path d="M2 4l4 4 4-4" /></svg>
              </button>
              <AnimatePresence>
                {showSeo && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className={LABEL_CLASS}>Titulo SEO</label>
                        <input value={data.seo_title} onChange={(e) => setData({ ...data, seo_title: e.target.value })}
                          placeholder={data.title || 'Titulo para buscadores'} className={INPUT_CLASS + ' text-xs'} />
                        <p className="text-[10px] text-[rgb(var(--texto-sutil-rgb))] font-sans mt-1">{(data.seo_title || data.title || '').length}/60</p>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Meta description</label>
                        <textarea value={data.seo_description} onChange={(e) => setData({ ...data, seo_description: e.target.value })}
                          placeholder={data.excerpt || 'Descricao para buscadores'} rows={2} className={INPUT_CLASS + ' resize-y text-xs'} />
                        <p className="text-[10px] text-[rgb(var(--texto-sutil-rgb))] font-sans mt-1">{(data.seo_description || data.excerpt || '').length}/160</p>
                        <p className="text-[10px] text-[rgb(var(--texto-sutil-rgb))] font-sans mt-1 leading-relaxed">
                          Opcional — só preencha se quiser um texto diferente do Resumo pra buscadores e prévia de link. Vazio, usa o Resumo.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Blog Manager ──────────────────────────────────────────────
export default function BlogManager({ addToast, addLogEntry }) {
  const [posts, setPosts] = useState(() => loadFromStorage(STORAGE_KEY, []));
  const [seriesList, setSeriesList] = useState(() => loadFromStorage(SERIES_STORAGE_KEY, []));
  const [editingPostId, setEditingPostId] = useState(null);
  const [view, setView] = useState('list');
  const [showSeries, setShowSeries] = useState(false);
  const [showAuthorBox, setShowAuthorBox] = useState(false);

  // Persist
  useEffect(() => { saveToStorage(STORAGE_KEY, posts); }, [posts]);
  useEffect(() => { saveToStorage(SERIES_STORAGE_KEY, seriesList); }, [seriesList]);

  const handleNewPost = () => {
    const post = {
      id: generateId(), title: '', slug: '', excerpt: '', content: null, content_html: '',
      featured_image: '', featured_image_alt: '', featured_cover: '', featured_cover_alt: '', author: 'Angelo',
      seo_title: '', seo_description: '', tags: [], status: 'draft',
      pinned: false, seriesId: '', seriesOrder: 0, scheduled_at: '',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
    setEditingPostId(post.id);
    setView('edit');
    addLogEntry?.('Post criado', 'Novo rascunho');
  };

  const handleEdit = (id) => {
    setEditingPostId(id);
    setView('edit');
  };

  const handleSave = useCallback((payload, isAutosave = false) => {
    setPosts((prev) => prev.map((p) =>
      p.id === editingPostId
        ? { ...p, ...payload, updated_at: new Date().toISOString() }
        : p
    ));
    if (!isAutosave) addToast?.('Post salvo', 'success');
  }, [editingPostId, addToast]);

  const handleDelete = (id) => {
    const p = posts.find((x) => x.id === id);
    setPosts((prev) => prev.filter((x) => x.id !== id));
    if (editingPostId === id) { setView('list'); setEditingPostId(null); }
    addToast?.('Post excluido', 'success');
    addLogEntry?.('Post excluido', p?.title || '');
  };

  const handleDuplicate = (id) => {
    const original = posts.find((p) => p.id === id);
    if (!original) return;
    const dup = {
      ...original, id: generateId(), title: original.title + ' (copia)',
      slug: generateSlug(original.title + ' copia'), status: 'draft',
      pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const copy = [...prev];
      copy.splice(idx + 1, 0, dup);
      return copy;
    });
    addToast?.('Post duplicado', 'success');
    addLogEntry?.('Post duplicado', dup.title);
  };

  const handleTogglePublish = (id) => {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const newStatus = p.status === 'published' ? 'draft' : 'published';
      return { ...p, status: newStatus, updated_at: new Date().toISOString() };
    }));
  };

  const handleTogglePin = (id) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
  };

  const handleBatchPublish = (ids) => {
    setPosts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, status: 'published', updated_at: new Date().toISOString() } : p));
    addToast?.(`${ids.length} posts publicados`, 'success');
  };

  const handleBatchUnpublish = (ids) => {
    setPosts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, status: 'draft', updated_at: new Date().toISOString() } : p));
    addToast?.(`${ids.length} posts despublicados`, 'success');
  };

  const handleBatchDelete = (ids) => {
    setPosts((prev) => prev.filter((p) => !ids.includes(p.id)));
    addToast?.(`${ids.length} posts excluidos`, 'success');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingPostId(null);
  };

  const editingPost = posts.find((p) => p.id === editingPostId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {view === 'list' ? (
        <>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Blog ({posts.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowAuthorBox(!showAuthorBox)} className={BTN_SECONDARY}>
                {showAuthorBox ? 'Ocultar autor' : 'Autor'}
              </button>
              <button onClick={() => setShowSeries(!showSeries)} className={BTN_SECONDARY}>
                {showSeries ? 'Ocultar series' : 'Series'}
              </button>
              <button onClick={handleNewPost} className={BTN_PRIMARY}>+ Novo Post</button>
            </div>
          </div>

          <AnimatePresence>
            {showAuthorBox && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <AuthorBoxManager addToast={addToast} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSeries && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <SeriesManager seriesList={seriesList} setSeriesList={setSeriesList} addToast={addToast} />
              </motion.div>
            )}
          </AnimatePresence>

          <PostList
            posts={posts}
            seriesList={seriesList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onTogglePublish={handleTogglePublish}
            onTogglePin={handleTogglePin}
            onBatchPublish={handleBatchPublish}
            onBatchUnpublish={handleBatchUnpublish}
            onBatchDelete={handleBatchDelete}
          />
        </>
      ) : editingPost ? (
        <PostEditor
          post={editingPost}
          seriesList={seriesList}
          onSave={handleSave}
          onCancel={handleBackToList}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-[rgb(var(--texto-sutil-rgb))] font-sans">Post nao encontrado.</p>
          <button onClick={handleBackToList} className={BTN_SECONDARY + ' mt-4'}>Voltar</button>
        </div>
      )}
    </motion.div>
  );
}

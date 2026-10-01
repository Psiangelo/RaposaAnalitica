'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Blockquote from '@tiptap/extension-blockquote';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Node, mergeAttributes } from '@tiptap/core';
import GlossaryTermMark from '@/components/admin/GlossaryTermMark';
import GlossaryTermPopover from '@/components/admin/GlossaryTermPopover';
import { useCallback, useState, useEffect, useRef } from 'react';

// ─── Custom Callout Extension ───────────────────────────────────────
const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (el) => el.getAttribute('data-callout-type') || 'info',
        renderHTML: (attrs) => ({ 'data-callout-type': attrs.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        class: `blog-callout blog-callout-${HTMLAttributes['data-callout-type'] || 'info'}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleCallout:
        (type) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
    };
  },
});

// ─── Custom Details/Toggle Extension ────────────────────────────────
const Details = Node.create({
  name: 'details',
  group: 'block',
  content: 'detailsSummary block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'details' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { class: 'blog-details' }), 0];
  },

  addCommands() {
    return {
      insertDetails:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: 'details',
              content: [
                { type: 'detailsSummary', content: [{ type: 'text', text: 'Clique para expandir' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Conteudo aqui...' }] },
              ],
            })
            .run();
        },
    };
  },
});

const DetailsSummary = Node.create({
  name: 'detailsSummary',
  group: 'block',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'summary' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes, { class: 'blog-details-summary' }), 0];
  },
});

// ─── Toolbar Icons ──────────────────────────────────────────────────
const icons = {
  bold: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  italic: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  underline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  strikethrough: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4H9a3 3 0 0 0 0 6h6" /><line x1="4" y1="12" x2="20" y2="12" /><path d="M15 12a3 3 0 1 1 0 6H8" />
    </svg>
  ),
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  glossary: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
    </svg>
  ),
  quote: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 11H6.101c.001-.009.002-.018.003-.027.094-.656.397-1.36.876-1.948C7.567 8.364 8.407 7.7 9.7 7.23l-.6-1.46c-1.607.582-2.753 1.46-3.456 2.413C4.928 9.263 4.5 10.478 4.5 11.7V17h5.5v-6zm9.5 0h-3.899c.001-.009.002-.018.003-.027.094-.656.397-1.36.876-1.948C17.067 8.364 17.907 7.7 19.2 7.23l-.6-1.46c-1.607.582-2.753 1.46-3.456 2.413C14.428 9.263 14 10.478 14 11.7V17h5.5v-6z" />
    </svg>
  ),
  pullquote: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <path d="M7 11h2a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2" />
      <path d="M14 11h2a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2" />
    </svg>
  ),
  ul: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  ol: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  ),
  alignLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  ),
  alignCenter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  ),
  alignRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  ),
  hr: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  undo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  redo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  callout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  toggle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  highlight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
};

// ─── Toolbar Button ─────────────────────────────────────────────────
function ToolbarBtn({ icon, label, active, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded transition-all ${
        active
          ? 'bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))]'
          : 'text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-forte-rgb))] hover:bg-[rgb(var(--linha-rgb))]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon}
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-5 bg-[rgb(var(--acento-rgb)/0.12)] mx-1" />;
}

// ─── Link Input Popover ─────────────────────────────────────────────
function LinkPopover({ onSubmit, onClose, initialUrl }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [newTab, setNewTab] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.2)] rounded-lg p-3 shadow-xl min-w-[320px]">
      <input
        ref={inputRef}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(url, newTab);
          if (e.key === 'Escape') onClose();
        }}
        className="w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] rounded px-3 py-2 text-sm text-[rgb(var(--texto-forte-rgb))] font-sans focus:outline-none focus:border-[rgb(var(--acento-rgb))] transition-colors"
      />
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 text-xs text-[rgb(var(--texto-dim-rgb))] font-sans cursor-pointer">
          <input
            type="checkbox"
            checked={newTab}
            onChange={(e) => setNewTab(e.target.checked)}
            className="accent-[rgb(var(--acento-rgb))]"
          />
          Abrir em nova aba
        </label>
        <div className="flex gap-2">
          <button onClick={onClose} className="text-xs text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--texto-rgb))] font-sans px-2 py-1">
            Cancelar
          </button>
          <button
            onClick={() => onSubmit(url, newTab)}
            className="text-xs bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] font-sans font-semibold px-3 py-1 rounded transition-colors hover:bg-[rgb(var(--acento-forte-rgb))]"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Heading Dropdown ───────────────────────────────────────────────
function HeadingDropdown({ editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLevel = [1, 2, 3, 4].find((l) => editor.isActive('heading', { level: l }));
  const label = currentLevel ? `H${currentLevel}` : 'Texto';

  const options = [
    { label: 'Texto normal', action: () => editor.chain().focus().setParagraph().run() },
    { label: 'Titulo 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), level: 1 },
    { label: 'Titulo 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), level: 2 },
    { label: 'Titulo 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), level: 3 },
    { label: 'Titulo 4', action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), level: 4 },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-sans text-[rgb(var(--texto-rgb))] hover:bg-[rgb(var(--linha-rgb))] transition-colors"
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 3.5l3 3 3-3" /></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.2)] rounded-lg shadow-xl overflow-hidden min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => { opt.action(); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm font-sans hover:bg-[rgb(var(--acento-rgb)/0.1)] transition-colors ${
                opt.level && editor.isActive('heading', { level: opt.level })
                  ? 'text-[rgb(var(--acento-rgb))] font-medium'
                  : !opt.level && !currentLevel
                  ? 'text-[rgb(var(--acento-rgb))] font-medium'
                  : 'text-[rgb(var(--texto-rgb))]'
              }`}
              style={opt.level ? { fontSize: `${18 - opt.level * 2}px`, fontFamily: 'var(--f-serif)' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Callout Dropdown ───────────────────────────────────────────────
function CalloutDropdown({ editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const types = [
    { type: 'info', label: 'Nota', color: '#60A5FA' },
    { type: 'tip', label: 'Dica', color: '#34D399' },
    { type: 'warning', label: 'Aviso', color: '#FBBF24' },
    { type: 'danger', label: 'Importante', color: '#F87171' },
  ];

  return (
    <div ref={ref} className="relative">
      <ToolbarBtn
        icon={icons.callout}
        label="Callout"
        active={editor.isActive('callout')}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.2)] rounded-lg shadow-xl overflow-hidden min-w-[140px]">
          {types.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => {
                editor.chain().focus().toggleCallout(t.type).run();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-[rgb(var(--texto-rgb))] hover:bg-[rgb(var(--acento-rgb)/0.1)] transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Blockquote extendido com atributo `pullquote` (boolean) — quando true,
// adiciona class="pullquote" no HTML pro CSS editorial em globals.css
// aplicar o visual de destaque.
const PullquoteBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      pullquote: {
        default: false,
        parseHTML: (el) => el.classList.contains('pullquote'),
        renderHTML: (attrs) => (attrs.pullquote ? { class: 'pullquote' } : {}),
      },
    };
  },
});

// ─── Main Editor Component ──────────────────────────────────────────
export default function BlogEditor({ content, onChange, placeholder = 'Comece a escrever...' }) {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const linkBtnRef = useRef(null);
  // Botão "apontar para verbete do glossário" (GlossaryTermPopover)
  const [showTermPopover, setShowTermPopover] = useState(false);
  const termBtnRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // Desabilita blockquote padrao pra usar a versao custom com pullquote
        blockquote: false,
      }),
      PullquoteBlockquote,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'blog-link' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'blog-image' },
      }),
      Youtube.configure({
        HTMLAttributes: { class: 'blog-youtube' },
        width: 0,
        height: 0,
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      Callout,
      GlossaryTermMark,
      Details,
      DetailsSummary,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange({
          json: editor.getJSON(),
          html: editor.getHTML(),
        });
      }
    },
    editorProps: {
      attributes: {
        class: 'blog-editor-content',
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content && typeof content === 'object' && content.type === 'doc') {
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = JSON.stringify(content);
      if (currentJson !== newJson) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const handleInsertLink = useCallback(
    (url, newTab) => {
      if (!url) {
        editor.chain().focus().unsetLink().run();
      } else {
        const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: fullUrl, target: newTab ? '_blank' : null })
          .run();
      }
      setShowLinkPopover(false);
    },
    [editor],
  );

  const handleInsertImage = useCallback(() => {
    const url = window.prompt('URL da imagem:');
    if (!url) return;
    const alt = window.prompt('Texto alternativo (alt):') || '';
    editor.chain().focus().setImage({ src: url, alt }).run();
  }, [editor]);

  const handleInsertYoutube = useCallback(() => {
    const url = window.prompt('URL do video do YouTube:');
    if (!url) return;
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-[rgb(var(--acento-rgb)/0.15)] rounded-xl overflow-hidden bg-[rgb(var(--fundo-rgb))]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[rgb(var(--fundo-2-rgb))] border-b border-[rgb(var(--acento-rgb)/0.1)]">
        {/* Undo/Redo */}
        <ToolbarBtn icon={icons.undo} label="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <ToolbarBtn icon={icons.redo} label="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />

        <ToolbarSep />

        {/* Heading dropdown */}
        <HeadingDropdown editor={editor} />

        <ToolbarSep />

        {/* Inline formatting */}
        <ToolbarBtn icon={icons.bold} label="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarBtn icon={icons.italic} label="Italico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarBtn icon={icons.underline} label="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarBtn icon={icons.strikethrough} label="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarBtn icon={icons.highlight} label="Destacar" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight({ color: '#2E524040' }).run()} />
        <ToolbarBtn icon={icons.code} label="Codigo inline" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />

        <ToolbarSep />

        {/* Link */}
        <div ref={linkBtnRef} className="relative">
          <ToolbarBtn
            icon={icons.link}
            label="Link"
            active={editor.isActive('link')}
            onClick={() => setShowLinkPopover(!showLinkPopover)}
          />
          {showLinkPopover && (
            <LinkPopover
              initialUrl={editor.getAttributes('link').href}
              onSubmit={handleInsertLink}
              onClose={() => setShowLinkPopover(false)}
            />
          )}
        </div>

        {/* Verbete do glossário — marcação manual, para o que o autolink não
            tem como adivinhar (ver GlossaryTermMark.js) */}
        <div ref={termBtnRef} className="relative">
          <ToolbarBtn
            icon={icons.glossary}
            label="Apontar para verbete do glossário"
            active={editor.isActive('glossaryTerm')}
            onClick={() => setShowTermPopover(!showTermPopover)}
          />
          {showTermPopover && (
            <GlossaryTermPopover
              selectedText={editor.state.doc.textBetween(
                editor.state.selection.from,
                editor.state.selection.to,
                ' ',
              )}
              currentSlug={editor.getAttributes('glossaryTerm').slug}
              onSubmit={(slug) => {
                editor.chain().focus().setGlossaryTerm(slug).run();
                setShowTermPopover(false);
              }}
              onRemove={() => {
                editor.chain().focus().unsetGlossaryTerm().run();
                setShowTermPopover(false);
              }}
              onClose={() => setShowTermPopover(false)}
            />
          )}
        </div>

        <ToolbarSep />

        {/* Alignment */}
        <ToolbarBtn icon={icons.alignLeft} label="Alinhar esquerda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarBtn icon={icons.alignCenter} label="Centralizar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarBtn icon={icons.alignRight} label="Alinhar direita" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />

        <ToolbarSep />

        {/* Lists */}
        <ToolbarBtn icon={icons.ul} label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarBtn icon={icons.ol} label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />

        <ToolbarSep />

        {/* Block elements */}
        <ToolbarBtn icon={icons.quote} label="Citacao" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarBtn
          icon={icons.pullquote || icons.quote}
          label="Destaque"
          active={editor.isActive('blockquote', { pullquote: true })}
          onClick={() => {
            const inBlockquote = editor.isActive('blockquote');
            const current = editor.getAttributes('blockquote').pullquote;
            if (!inBlockquote) {
              // Primeiro vira blockquote, dps marca como pullquote
              editor.chain().focus().toggleBlockquote().updateAttributes('blockquote', { pullquote: true }).run();
            } else {
              editor.chain().focus().updateAttributes('blockquote', { pullquote: !current }).run();
            }
          }}
        />
        <ToolbarBtn icon={icons.hr} label="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <CalloutDropdown editor={editor} />
        <ToolbarBtn icon={icons.toggle} label="Conteudo expansivel" onClick={() => editor.chain().focus().insertDetails().run()} />

        <ToolbarSep />

        {/* Media */}
        <ToolbarBtn icon={icons.image} label="Imagem" onClick={handleInsertImage} />
        <ToolbarBtn icon={icons.youtube} label="Video YouTube" onClick={handleInsertYoutube} />
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

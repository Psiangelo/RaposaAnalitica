'use client';

/**
 * BlockRenderer — renderiza um único bloco de etapa conforme `type`.
 * Tipos: text, link, media, embed, cartography, quote.
 *
 * Cada bloco aceita prop opcional `accent` (cor da área da trilha) pra
 * herdar a paleta visual da página. Link block enriquecido com capa
 * automática puxada do alvo (post.featured_cover, material.cover,
 * thumbnail YouTube) — fallback gracioso quando não há.
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import { resolveLink } from '@/lib/linkResolver';
import { deriveLinkThumb } from '@/lib/stageThumb';
import { resolveImageSrc } from '@/lib/basepath';
import TrilhaIcon from '@/components/estudos/icons';

/** Ícone semântico exibido no thumb fallback de cada kind de link block. */
const KIND_FALLBACK_ICON = {
  blog:      'essay',
  material:  'scroll',
  course:    'ritual',
  glossario: 'book',
  youtube:   'video',
  drive:     'video',
  url:       'threshold',
};

const CartographyView = dynamic(() => import('@/components/cartography/CartographyView'), {
  ssr: false,
  loading: () => (
    <div className="my-8 aspect-video bg-bg-card border border-border-subtle flex items-center justify-center">
      <span className="font-sans text-[12.5px] font-semibold text-text-dim tracking-[0.12em] uppercase">Carregando cartografia…</span>
    </div>
  ),
});

marked.setOptions({ gfm: true, breaks: false });

function ytEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.replace(/^\//, '').split('/')[0]}`;
    if (host.endsWith('youtube.com')) {
      if (u.pathname === '/watch') return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/shorts/')) return `https://www.youtube.com/embed/${u.pathname.replace('/shorts/', '').split('/')[0]}`;
    }
  } catch { /* not a URL */ }
  return null;
}

function driveEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('drive.google.com')) return null;
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  } catch { /* not a URL */ }
  return null;
}

function renderText(body) {
  const html = marked.parse(String(body || ''));
  return (
    <div
      className="prose-glossario estudos-text-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function LinkBlock({ block, lists, accent }) {
  const resolved = resolveLink(block.link, lists);
  const thumb = deriveLinkThumb(block.link, lists);
  const tone = accent || '#2E5240';
  const kind = block.link?.kind;
  const fallbackIcon = KIND_FALLBACK_ICON[kind] || 'essay';

  if (resolved.missing) return null;

  if (!resolved.href) {
    return (
      <div
        className="my-6 border p-4 rounded-sm"
        style={{ borderColor: `${tone}33`, background: 'rgba(0,0,0,0.18)' }}
      >
        <p className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: `${tone}b3` }}>
          {resolved.kindLabel}
        </p>
        <p className="font-serif italic text-text-dim">{resolved.label || 'Sem link'}</p>
      </div>
    );
  }

  const inner = (
    <article
      className="group flex flex-col sm:flex-row items-stretch overflow-hidden bg-bg-card border rounded-sm transition-colors"
      style={{ borderColor: `${tone}33` }}
    >
      {/* Thumb à esquerda */}
      <div
        className="relative sm:w-36 sm:flex-shrink-0 h-32 sm:h-auto sm:min-h-[128px] overflow-hidden order-first flex items-center justify-center"
        style={{
          background: thumb
            ? 'transparent'
            : `linear-gradient(135deg, ${tone}22, ${tone}0d 60%, transparent)`,
        }}
      >
        {thumb ? (
          <>
            <img
              src={resolveImageSrc(thumb)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, transparent 40%, ${tone}26)` }}
            />
          </>
        ) : (
          <span
            className="relative transition-transform duration-500 group-hover:scale-105"
            style={{ color: `${tone}cc` }}
            aria-hidden
          >
            <TrilhaIcon name={fallbackIcon} size={56} strokeWidth={1.3} />
          </span>
        )}
      </div>

      {/* Texto à direita */}
      <div className="flex-1 p-5 flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p
            className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-1.5"
            style={{ color: tone }}
          >
            {resolved.kindLabel}
          </p>
          <p
            className="font-serif text-[1.05rem] md:text-[1.15rem] text-text-bright group-hover:[color:var(--link-accent)] transition-colors leading-tight"
            style={{ '--link-accent': tone }}
          >
            {resolved.label}
          </p>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tone}
          strokeWidth="1.6"
          className="flex-shrink-0 transition-transform group-hover:translate-x-1"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  );

  return (
    <div className="my-6">
      {resolved.isExternal ? (
        <a href={resolved.href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
      ) : (
        <Link href={resolved.href} className="block">{inner}</Link>
      )}
    </div>
  );
}

function MediaBlock({ block }) {
  const src = block.provider === 'drive' ? driveEmbed(block.url) : ytEmbed(block.url);
  if (!src) {
    return (
      <div className="my-6 p-4 bg-bg-card border border-border-subtle">
        <p className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-amber-500 mb-1">
          Vídeo inválido
        </p>
        <p className="font-serif italic text-text-dim text-sm break-all">{block.url}</p>
      </div>
    );
  }
  return (
    <div className="my-8">
      <div className="aspect-video bg-bg-card border border-border-subtle overflow-hidden rounded-sm">
        <iframe
          src={src}
          title={block.caption || 'Vídeo'}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      {block.caption && (
        <p className="font-serif italic text-text-dim text-sm mt-2">{block.caption}</p>
      )}
    </div>
  );
}

function EmbedBlock({ block }) {
  return (
    <div className="my-8">
      <div
        className="bg-bg-card border border-border-subtle p-4 rounded-sm"
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
      {block.caption && (
        <p className="font-serif italic text-text-dim text-sm mt-2">{block.caption}</p>
      )}
    </div>
  );
}

function CartographyBlock({ block }) {
  return (
    <div className="my-8">
      <CartographyView slug={block.slug || 'home'} compact />
      {block.caption && (
        <p className="font-serif italic text-text-dim text-sm mt-2 text-center">{block.caption}</p>
      )}
    </div>
  );
}

function QuoteBlock({ block, accent }) {
  const tone = accent || '#2E5240';
  return (
    <blockquote
      className="relative my-10 px-6 md:px-10 py-6 rounded-sm overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${tone}0d, transparent 70%)`,
        borderLeft: `2px solid ${tone}`,
      }}
    >
      {/* Glyph decorativo gigante atrás */}
      <span
        aria-hidden
        className="absolute -top-4 right-3 font-serif italic select-none pointer-events-none"
        style={{
          color: `${tone}1a`,
          fontSize: 'clamp(6rem, 12vw, 9rem)',
          lineHeight: 1,
        }}
      >
        ❝
      </span>
      <p className="relative font-serif italic text-[1.15rem] md:text-[1.25rem] text-text-bright leading-[1.7] mb-3 max-w-prose">
        {block.body}
      </p>
      {block.cite && (
        <cite
          className="relative font-sans text-[12.5px] font-semibold not-italic tracking-[0.12em] uppercase"
          style={{ color: tone }}
        >
          — {block.cite}
        </cite>
      )}
    </blockquote>
  );
}

export default function BlockRenderer({ block, lists, accent }) {
  if (!block || !block.type) return null;
  switch (block.type) {
    case 'text':        return renderText(block.body);
    case 'link':        return <LinkBlock block={block} lists={lists} accent={accent} />;
    case 'media':       return <MediaBlock block={block} />;
    case 'embed':       return <EmbedBlock block={block} />;
    case 'cartography': return <CartographyBlock block={block} />;
    case 'quote':       return <QuoteBlock block={block} accent={accent} />;
    default:            return null;
  }
}

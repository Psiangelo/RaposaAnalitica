'use client';

import Link from 'next/link';
import { renderHighlightedTitle } from '@/lib/highlightTitle';

/**
 * PrevNextPost — navegação sequencial "anterior / próximo" ao final do post.
 * Baseia-se em ordem cronológica (updated_at desc) dos published posts.
 * Pinned não altera essa ordem — aqui é timeline editorial pura.
 *
 * Links reais (/blog/<slug>/) — cada post tem sua própria rota estática,
 * então não há mais motivo pra swap local via onNavigate.
 */
export default function PrevNextPost({ currentPost, allPosts }) {
  const published = allPosts
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  const idx = published.findIndex((p) => p.id === currentPost.id);
  if (idx < 0) return null;

  // Ordem cronológica: newer no indice menor, older no maior.
  // "Próximo" (na leitura) = mais recente; "anterior" = mais antigo.
  const next = idx > 0 ? published[idx - 1] : null;
  const prev = idx < published.length - 1 ? published[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Navegação entre publicações"
      className="mt-14 pt-8 border-t border-linha grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {prev ? (
        <Link
          href={`/blog/${prev.slug || prev.id}/`}
          className="group text-left p-5 rounded-[20px] border-[1.5px] border-linha hover:border-[var(--torii)] bg-bg-card transition-colors"
        >
          <span className="font-sans text-[12px] font-semibold tracking-[0.14em] uppercase text-text-dim flex items-center gap-2">
            <span aria-hidden>←</span> Ensaio anterior
          </span>
          <h3 className="mt-2 font-serif text-[1.2rem] font-bold text-text-bright leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {renderHighlightedTitle(prev.title)}
          </h3>
        </Link>
      ) : <span />}

      {next ? (
        <Link
          href={`/blog/${next.slug || next.id}/`}
          className="group text-right p-5 rounded-[20px] border-[1.5px] border-linha hover:border-[var(--torii)] bg-bg-card transition-colors"
        >
          <span className="font-sans text-[12px] font-semibold tracking-[0.14em] uppercase text-text-dim flex items-center justify-end gap-2">
            Próximo ensaio <span aria-hidden>→</span>
          </span>
          <h3 className="mt-2 font-serif text-[1.2rem] font-bold text-text-bright leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {renderHighlightedTitle(next.title)}
          </h3>
        </Link>
      ) : <span />}
    </nav>
  );
}

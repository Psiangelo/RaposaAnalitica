'use client';

import Link from 'next/link';
import TrilhaIcon from './icons';
import { findArea } from '@/lib/areas';

/**
 * PrevNextTrilhas — navegação entre trilhas no rodapé da detail.
 *
 * Mostra trilha anterior e próxima (na ordem em que estão no array global).
 * Cada lado mostra: chip-área, nome serif, ícone.
 *
 * Props:
 *   prev: trilha anterior ou null
 *   next: próxima trilha ou null
 *   areas: lista de áreas pra resolver cor/ícone
 */
export default function PrevNextTrilhas({ prev, next, areas = [] }) {
  if (!prev && !next) return null;

  return (
    <section className="py-12 md:py-16 px-5 sm:px-6 md:px-12 border-t border-border-subtle/40">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <NavCard trilha={prev} areas={areas} direction="prev" />
        <NavCard trilha={next} areas={areas} direction="next" />
      </div>
    </section>
  );
}

function NavCard({ trilha, areas, direction }) {
  const isNext = direction === 'next';
  if (!trilha) {
    return <div className="hidden md:block" aria-hidden />;
  }
  const area = findArea(areas, trilha.area);
  const accent = area?.color || '#2E5240';
  const slug = trilha.slug || trilha.id;

  return (
    <Link
      href={`/trilhas/${slug}`}
      className="group block p-5 md:p-6 bg-bg-card border border-border-subtle hover:border-accent/40 rounded-sm transition-colors"
      style={{ '--nc-accent': accent }}
    >
      <div className={`flex items-center justify-between gap-3 mb-3 ${isNext ? 'flex-row-reverse' : ''}`}>
        <span
          className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: accent }}
        >
          {isNext ? 'Próxima trilha →' : '← Trilha anterior'}
        </span>
        {area && (
          <span
            className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold tracking-[0.2em] uppercase px-2 py-0.5 rounded"
            style={{
              color: accent,
              background: `${accent}10`,
              border: `1px solid ${accent}33`,
            }}
          >
            <TrilhaIcon name={area.icon} size={10} />
            {area.label}
          </span>
        )}
      </div>

      <div className={`flex items-center gap-4 ${isNext ? 'flex-row-reverse text-right' : ''}`}>
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-full border flex-shrink-0 transition-transform group-hover:scale-105"
          style={{
            color: accent,
            borderColor: `${accent}66`,
            background: `${accent}0d`,
          }}
        >
          <TrilhaIcon name={trilha.icon || 'compass'} size={22} />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-[1.15rem] md:text-[1.25rem] leading-tight text-text-bright group-hover:[color:var(--nc-accent)] transition-colors truncate">
            {trilha.name}
          </h3>
          {trilha.subtitle && (
            <p className="font-serif italic text-[0.85rem] text-text-dim/80 leading-snug mt-1 line-clamp-1">
              {trilha.subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

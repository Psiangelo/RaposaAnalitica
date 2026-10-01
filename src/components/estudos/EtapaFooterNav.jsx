'use client';

import Link from 'next/link';
import TrilhaIcon from './icons';
import { defaultIconForKind, iconLabel } from '@/lib/trilhaIcons';
import { toRoman } from '@/lib/stageThumb';
import { STAGE_KIND_LABEL } from '@/data/trilhas';

/**
 * EtapaFooterNav — navegação rica anterior/próxima entre etapas da trilha.
 *
 * Props:
 *   prev, next: stage ou null
 *   prevIdx, nextIdx: índice (0-based)
 *   trilhaSlug, trilhaName
 *   accent: cor da área
 */
export default function EtapaFooterNav({ prev, next, prevIdx, nextIdx, trilhaSlug, trilhaName, accent = '#2E5240' }) {
  return (
    <nav
      aria-label="Navegação entre etapas"
      className="mt-12 md:mt-16 pt-8 border-t border-border-subtle/40 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <NavCard
        stage={prev}
        idx={prevIdx}
        direction="prev"
        trilhaSlug={trilhaSlug}
        trilhaName={trilhaName}
        accent={accent}
      />
      <NavCard
        stage={next}
        idx={nextIdx}
        direction="next"
        trilhaSlug={trilhaSlug}
        trilhaName={trilhaName}
        accent={accent}
      />
    </nav>
  );
}

function NavCard({ stage, idx, direction, trilhaSlug, trilhaName, accent }) {
  const isNext = direction === 'next';

  if (!stage) {
    // No último ou primeiro: CTA pra voltar pro sumário (se 'next' ausente) ou placeholder
    if (isNext) {
      return (
        <Link
          href={`/trilhas/${trilhaSlug}`}
          className="group block p-5 md:p-6 rounded-sm transition-colors"
          style={{
            background: `${accent}10`,
            border: `1px solid ${accent}55`,
          }}
        >
          <span
            className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-2 inline-block"
            style={{ color: accent }}
          >
            ✦ Última etapa
          </span>
          <p className="font-serif text-[1.1rem] text-text-bright leading-tight">
            Voltar ao sumário da trilha
          </p>
          <p className="text-[0.8rem] text-text-dim italic mt-1 truncate">{trilhaName}</p>
        </Link>
      );
    }
    return <div className="hidden md:block" aria-hidden />;
  }

  const iconName = stage.icon || defaultIconForKind(stage.kind);
  const kindLabel = STAGE_KIND_LABEL[stage.kind] || stage.kind || '';
  const number = toRoman(idx + 1);
  const stageHref = `/trilhas/${trilhaSlug}/${stage.slug || stage.title}`;

  return (
    <Link
      href={stageHref}
      className="group block p-5 md:p-6 bg-bg-card border border-border-subtle hover:border-accent/40 rounded-sm transition-colors"
      style={{ '--nav-accent': accent }}
    >
      <span
        className={`font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-3 inline-flex items-center gap-2 ${
          isNext ? 'float-right' : ''
        }`}
        style={{ color: accent }}
      >
        {isNext ? 'Próxima etapa →' : '← Etapa anterior'}
      </span>

      <div className={`flex items-center gap-4 clear-both ${isNext ? 'flex-row-reverse text-right' : ''}`}>
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-full border flex-shrink-0 transition-transform group-hover:scale-105"
          style={{
            color: accent,
            borderColor: `${accent}66`,
            background: `${accent}0d`,
          }}
          title={iconLabel(iconName)}
        >
          <TrilhaIcon name={iconName} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-2 mb-1 ${isNext ? 'justify-end' : ''}`}>
            <span
              className="font-serif italic text-[0.95rem]"
              style={{ color: `${accent}cc` }}
            >
              {number}
            </span>
            {kindLabel && (
              <span className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-text-dim/70">
                {kindLabel}
              </span>
            )}
          </div>
          <h3
            className="font-serif text-[1.05rem] md:text-[1.15rem] leading-tight text-text-bright group-hover:[color:var(--nav-accent)] transition-colors truncate"
          >
            {stage.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

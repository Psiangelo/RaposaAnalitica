'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import TrilhaIcon, { IconSeal } from './icons';

/**
 * ContinueBanner — marco "Continue de onde parou" no topo da timeline.
 *
 * Mostra a trilha em andamento com mais progresso. CTA aponta pra próxima
 * etapa não concluída (se houver), senão pra detail da trilha.
 *
 * Props:
 *   trilha: objeto migrated (com area, icon)
 *   pct: number
 *   nextStage: { slug, title, icon }
 *   accent: string
 */
export default function ContinueBanner({ trilha, pct, nextStage, accent = '#2E5240' }) {
  if (!trilha) return null;
  const slug = trilha.slug || trilha.id;
  const href = nextStage?.slug
    ? `/trilhas/${slug}/${nextStage.slug}`
    : `/trilhas/${slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-10 overflow-hidden rounded-sm"
      style={{
        background: `linear-gradient(135deg, ${accent}14, transparent 60%)`,
        border: `1px solid ${accent}33`,
        borderLeftWidth: 3,
      }}
    >
      <div className="relative flex items-center justify-between gap-5 flex-wrap p-5 md:p-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <IconSeal name={trilha.icon || 'compass'} size={56} color={accent} />
          <div className="min-w-0">
            <p className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: accent }}>
              Continue de onde parou
            </p>
            <p className="font-serif text-text-bright text-lg md:text-xl leading-tight truncate">
              {trilha.name}
            </p>
            <p className="text-[0.8rem] text-text-dim mt-1.5 flex items-center gap-2 flex-wrap">
              <span>{pct}% concluído</span>
              {nextStage && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1.5">
                    próxima:
                    <TrilhaIcon name={nextStage.icon || 'book'} size={12} />
                    <em className="italic" style={{ color: accent }}>{nextStage.title}</em>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-5 py-2.5 font-sans text-[12.5px] font-semibold font-semibold tracking-[0.12em] uppercase transition-colors flex-shrink-0 rounded-sm"
          style={{
            background: accent,
            color: '#F2EBDC',
          }}
        >
          Continuar
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Barra de progresso na base do banner */}
      <div className="h-[2px] bg-border-subtle/40">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: accent }}
        />
      </div>
    </motion.div>
  );
}

'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { marked } from 'marked';
import BlockRenderer from './BlockRenderer';
import TrilhaIcon from './icons';
import { toRoman } from '@/lib/stageThumb';
import { isExtra, resolveExtraAccent, EXTRA_ICON } from '@/lib/extraTone';

/**
 * SubstageBlock — renderiza um bloco type='substage' na página da etapa.
 *
 * Layout cerimonial minimalista:
 *  - Linha divisória superior (mais sólida quando concluída)
 *  - Header: numeração romana grande + título + toggle "marcar concluída"
 *  - Intro markdown (opcional)
 *  - Conteúdo interno: blocks (text/link/media/embed/cartography/quote)
 *    renderizados via BlockRenderer (sem substage aninhado)
 *  - Linha divisória inferior
 *
 * Props:
 *   substage: { id, title, intro, blocks }
 *   idx: número da sub-etapa (1-based) — usado pra numeração romana
 *   done: boolean
 *   onToggle: () => void
 *   accent: cor
 *   lists: { materials, posts, courses, glossario, cartographies }
 */
export default function SubstageBlock({ substage, idx, done, onToggle, accent = '#2E5240', lists }) {
  const prefersReduced = useReducedMotion();
  const number = toRoman(idx);
  const extra = isExtra(substage);
  const tone = resolveExtraAccent(substage, accent);
  const introHtml = useMemo(
    () => (substage?.intro ? marked.parse(String(substage.intro)) : ''),
    [substage?.intro]
  );
  const innerBlocks = (substage?.blocks || []).filter((b) => b?.type !== 'substage');

  const headerDividerStyle = {
    background: `linear-gradient(to right, transparent 0%, ${done ? tone : `${tone}66`} 20%, ${done ? tone : `${tone}66`} 80%, transparent 100%)`,
    height: done ? 1.5 : 1,
  };
  const footerDividerStyle = {
    background: `linear-gradient(to right, transparent 0%, ${tone}33 50%, transparent 100%)`,
    height: 1,
  };

  return (
    <section
      aria-label={`Sub-etapa ${idx}: ${substage?.title || ''}`}
      className="relative my-10 md:my-14"
    >
      {/* Divisória superior */}
      <div className="absolute top-0 left-0 right-0" style={headerDividerStyle} />

      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap pt-7 pb-5">
        <div className="flex items-baseline gap-4 min-w-0 flex-1">
          <motion.span
            initial={prefersReduced ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif italic leading-none flex-shrink-0"
            style={{
              color: done ? tone : `${tone}bb`,
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              letterSpacing: '0.05em',
            }}
            aria-hidden
          >
            {number}
          </motion.span>
          <div className="min-w-0">
            {extra && (
              <span
                className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded mb-1.5"
                style={{
                  color: tone,
                  background: `${tone}1a`,
                  border: `1px solid ${tone}55`,
                }}
                title="Sub-etapa extra — opcional"
              >
                <TrilhaIcon name={EXTRA_ICON} size={10} />
                Extra
              </span>
            )}
            <h3 className="font-serif text-text-bright text-[clamp(1.1rem,2vw,1.4rem)] leading-tight">
              {substage?.title}
            </h3>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? `Desmarcar sub-etapa ${idx}` : `Marcar sub-etapa ${idx} como concluída`}
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase transition-colors flex-shrink-0"
          style={
            done
              ? { background: tone, color: '#F2EBDC', border: `1px solid ${tone}` }
              : { background: `${tone}0d`, color: tone, border: `1px solid ${tone}55` }
          }
        >
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full"
            style={
              done
                ? { background: '#F2EBDC', color: tone }
                : { background: 'transparent', color: tone, border: `1px solid ${tone}88` }
            }
          >
            {done ? (
              <motion.svg
                initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-3 h-3"
              >
                <path d="M5 12l5 5L20 7" />
              </motion.svg>
            ) : (
              <span className="w-1 h-1 rounded-full" style={{ background: `${tone}aa` }} />
            )}
          </span>
          {done ? 'Concluída' : 'Marcar'}
        </motion.button>
      </header>

      {/* Intro markdown */}
      {introHtml && (
        <div
          className="estudos-text-block max-w-prose mb-4 text-[0.95rem]"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      )}

      {/* Conteúdo interno */}
      {innerBlocks.length > 0 && (
        <div className="pb-8">
          {innerBlocks.map((b, i) => (
            <BlockRenderer key={i} block={b} lists={lists} accent={tone} />
          ))}
        </div>
      )}

      {/* Divisória inferior — só se não houver outro substage logo a seguir
          (renderizada incondicional aqui, fica sutil quando há próximo) */}
      <div className="absolute bottom-0 left-0 right-0" style={footerDividerStyle} />
    </section>
  );
}

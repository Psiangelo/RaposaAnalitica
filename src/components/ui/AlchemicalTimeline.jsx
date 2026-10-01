'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * AlchemicalTimeline — as 4 fases da Grande Obra alquímica.
 * Indicada para séries do blog (cada post mapeia uma fase) ou para
 * visualizar progresso de uma trilha de transformação.
 *
 *   Nigredo    → escuridão / dissolução
 *   Albedo     → clareza / lavagem
 *   Citrinitas → reflexão / luz interior
 *   Rubedo     → unificação / vermelho
 *
 * Props:
 *   stages: [{ phase: 'nigredo'|'albedo'|'citrinitas'|'rubedo',
 *              label: string, post?: { title, slug } }]
 *   currentIdx: índice da fase ativa (0..3)
 *   compact: layout horizontal compacto (default true em desktop)
 */
const PHASE_META = {
  nigredo: {
    label: 'Nigredo',
    meaning: 'dissolução · escuridão',
    color: '#EBE2CD',
    border: '#2a1f17',
    text: '#56655D',
  },
  albedo: {
    label: 'Albedo',
    meaning: 'clareza · lavagem',
    color: '#13211F',
    border: '#13211F',
    text: '#F2EBDC',
  },
  citrinitas: {
    label: 'Citrinitas',
    meaning: 'reflexão · luz',
    color: '#962B24',
    border: '#962B24',
    text: '#F2EBDC',
  },
  rubedo: {
    label: 'Rubedo',
    meaning: 'unificação · vermelho',
    color: '#962B24',
    border: '#962B24',
    text: '#13211F',
  },
};

const PHASE_ORDER = ['nigredo', 'albedo', 'citrinitas', 'rubedo'];

export default function AlchemicalTimeline({
  stages,
  currentIdx = -1,
  title = 'Grande Obra',
  className = '',
  onSelectStage,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  // Se não vierem stages, monta as 4 fases padrão sem post
  const items = stages || PHASE_ORDER.map((p) => ({ phase: p, label: PHASE_META[p].label }));

  return (
    <section ref={ref} className={`my-10 ${className}`}>
      <header className="flex items-baseline gap-4 mb-6">
        <span className="font-sans text-[12.5px] font-semibold text-accent tracking-[0.12em] uppercase">
          {title}
        </span>
        <span className="flex-1 h-px bg-border-subtle" />
        <span className="font-sans text-[12.5px] font-semibold text-text-dim/60 tracking-[0.2em] uppercase">
          {items.length} fases
        </span>
      </header>

      <ol className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative">
        {/* Linha conectora horizontal no desktop */}
        <span className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-bg-warm via-accent/40 to-bg-warm pointer-events-none" />

        {items.map((stage, i) => {
          const meta = PHASE_META[stage.phase] || PHASE_META.nigredo;
          const active = i === currentIdx;
          const passed = i < currentIdx;
          const isFuture = currentIdx >= 0 && i > currentIdx;

          const Card = stage.post && onSelectStage ? 'button' : 'div';

          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col items-center text-center group ${isFuture ? 'opacity-50' : ''}`}
            >
              <Card
                onClick={stage.post && onSelectStage ? () => onSelectStage(stage) : undefined}
                className={`relative ${stage.post && onSelectStage ? 'cursor-pointer' : ''}`}
                style={stage.post && onSelectStage ? {} : { pointerEvents: 'none' }}
              >
                {/* Disco da fase */}
                <span
                  className={`relative z-10 block w-14 h-14 mb-3 rounded-full border-2 mx-auto transition-all duration-500 ${
                    active ? 'shadow-lg' : ''
                  }`}
                  style={{
                    background: meta.color,
                    borderColor: active ? meta.border : 'rgb(var(--acento-rgb)/0.3)',
                    boxShadow: active ? `0 0 24px ${meta.color}66` : 'none',
                  }}
                >
                  {passed && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={meta.text}
                      strokeWidth="2.5"
                      className="absolute inset-0 m-auto w-5 h-5"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {active && (
                    <span
                      className="absolute -inset-1 rounded-full border border-accent/50 animate-pulse"
                      aria-hidden
                    />
                  )}
                </span>

                {/* Label fase */}
                <p
                  className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-1"
                  style={{ color: active ? meta.color : '#2E5240' }}
                >
                  {meta.label}
                </p>
                <p className="font-serif italic text-[0.78rem] text-text-dim leading-snug mb-2">
                  {meta.meaning}
                </p>

                {/* Post linkado */}
                {stage.post && (
                  <p
                    className={`font-serif text-[0.88rem] leading-tight transition-colors ${
                      active ? 'text-text-bright' : 'text-text group-hover:text-accent'
                    }`}
                  >
                    {stage.post.title}
                  </p>
                )}
                {stage.label && !stage.post && (
                  <p className="font-serif text-[0.85rem] text-text-dim leading-tight">
                    {stage.label}
                  </p>
                )}
              </Card>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

'use client';

/**
 * Cartography (home/estudos) — thin wrapper que delega o trabalho para CartographyView.
 * Mantém o visual antigo (header com SectionLabel + legenda de tons) mas o grafo
 * em si vem do componente reutilizável `CartographyView slug="home"`.
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionLabel from '@/components/SectionLabel';
import { fadeUp, stagger } from '@/lib/constants';
import CartographyView from '@/components/cartography/CartographyView';

const TONE_FILL = {
  accent: '#2E5240',
  bright: '#13211F',
  citrinit: '#962B24',
  rubedo: '#962B24',
};

export default function Cartography({ slug = 'home' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id="cartografia"
      className="relative py-16 md:py-32 px-5 sm:px-6 md:px-12 bg-bg-warm overflow-hidden section-border-t section-border-b"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgb(var(--acento-rgb)/0.5) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <motion.div
        initial="visible"
        animate="visible"
        variants={stagger}
        className="relative max-w-[1180px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-end mb-10">
          <div>
            <SectionLabel label="Cartografia" />
          </div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2 text-[0.62rem] font-mono text-text-dim tracking-[0.18em] uppercase">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" /> Self · centro
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: TONE_FILL.citrinit }} /> reflexão
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: TONE_FILL.rubedo }} /> sombra · prática
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-text-bright" /> consciência
            </span>
          </motion.div>
        </div>

        <CartographyView slug={slug} />
      </motion.div>
    </section>
  );
}

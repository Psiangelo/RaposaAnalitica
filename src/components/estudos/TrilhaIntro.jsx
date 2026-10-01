'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';

/**
 * TrilhaIntro — bloco editorial com a `description` markdown da trilha.
 *
 * Apresenta como prosa cerimonial:
 *  - Eyebrow mono "Prelúdio" ou "Introdução"
 *  - Texto rico parseado por marked + classe .estudos-text-block (CSS global)
 *  - Max-width legível
 *  - Visualmente "separado" do hero por uma linha vertical à esquerda
 *
 * Props:
 *   description: markdown string
 *   accent: cor
 */
export default function TrilhaIntro({ description, accent = '#2E5240' }) {
  const html = useMemo(() => {
    if (!description) return '';
    return marked.parse(String(description));
  }, [description]);

  if (!html) return null;

  return (
    <section className="relative py-10 md:py-14 px-5 sm:px-6 md:px-12">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative pl-6 md:pl-10 max-w-[720px]"
        >
          {/* Espinha vertical accent */}
          <span
            aria-hidden
            className="absolute left-0 top-1 bottom-1 w-px"
            style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}33 60%, transparent)` }}
          />

          <p
            className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-4"
            style={{ color: accent }}
          >
            Prelúdio
          </p>

          <div
            className="estudos-text-block prose-trilha text-[1rem] text-text-bright"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>
      </div>
    </section>
  );
}

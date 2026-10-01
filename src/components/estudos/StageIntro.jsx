'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';

/**
 * StageIntro — prosa cerimonial de abertura da etapa.
 *
 * Renderiza o campo `intro` (markdown) que vive em cada stage.
 * Estética similar ao TrilhaIntro, mas com eyebrow "Abertura"
 * e espaçamento ligeiramente diferente.
 *
 * Props: content (markdown), accent
 */
export default function StageIntro({ content, accent = '#2E5240', eyebrow = 'Abertura' }) {
  const html = useMemo(() => {
    if (!content) return '';
    return marked.parse(String(content));
  }, [content]);

  if (!html) return null;

  return (
    <section className="relative pt-2 pb-8 md:pb-12 px-5 sm:px-6 md:px-12">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative pl-6 md:pl-10"
        >
          <span
            aria-hidden
            className="absolute left-0 top-1 bottom-1 w-px"
            style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}33 60%, transparent)` }}
          />

          {eyebrow && (
            <p
              className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase mb-3"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
          )}

          <div
            className="estudos-text-block text-[1rem] text-text-bright"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>
      </div>
    </section>
  );
}

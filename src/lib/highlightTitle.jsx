'use client';

/**
 * highlightTitle — permite marcar partes do título com *asterisco simples*
 * pra que sejam renderizadas em dourado (accent).
 *
 * Ex: "O que é *inconsciente* em Jung?" → "O que é <span class='text-accent italic'>inconsciente</span> em Jung?"
 *
 * Convenção minimalista — um par de asteriscos delimita o trecho.
 * Aceita múltiplos destaques. Escape de literal com "\\*".
 */

import React from 'react';

const PATTERN = /\*([^*]+)\*/g;

/**
 * @param {string} title
 * @param {object} [opts]
 * @param {string} [opts.accentClassName='text-accent italic']
 * @returns {React.ReactNode}
 */
export function renderHighlightedTitle(title, { accentClassName = 'text-accent-bright italic' } = {}) {
  if (!title || typeof title !== 'string') return title ?? '';
  if (!PATTERN.test(title)) return title;

  const nodes = [];
  let lastIndex = 0;
  let match;
  // Reset lastIndex após o test acima
  PATTERN.lastIndex = 0;
  let i = 0;
  while ((match = PATTERN.exec(title)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(title.slice(lastIndex, match.index));
    }
    nodes.push(
      <em key={`h${i++}`} className={accentClassName}>
        {match[1]}
      </em>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < title.length) {
    nodes.push(title.slice(lastIndex));
  }
  return <>{nodes}</>;
}

/** Remove os asteriscos — usado em contextos de texto puro (alt, meta, share). */
export function stripHighlights(title) {
  if (!title || typeof title !== 'string') return title ?? '';
  return title.replace(PATTERN, '$1');
}

'use client';

import { useEffect, useState } from 'react';

/**
 * useMediaQuery — hook simples pra reagir a media queries.
 * Retorna false no primeiro render (SSR-safe) e atualiza após mount.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// Detecta usuários que pedem animações reduzidas
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

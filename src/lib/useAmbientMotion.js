'use client';

import { useMediaQuery } from '@/lib/useMediaQuery';

/**
 * useAmbientMotion — libera (ou não) as animações puramente decorativas:
 * mandalas girando, selos alquímicos, ornamentos de capa.
 *
 * Cada uma delas é um loop de requestAnimationFrame que nunca termina. Uma só
 * não custa nada; o problema é a soma, porque o PosterCover coloca um ornamento
 * em cada capa e uma listagem tem várias. Em celular isso aparecia como queda
 * de FPS ao rolar.
 *
 * Retorna false em telas de celular e para quem pediu menos movimento. Como
 * media query só resolve depois da montagem, o primeiro render vem sem
 * animação, que é o lado seguro pra errar.
 */
export function useAmbientMotion() {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return !isPhone && !reduced;
}

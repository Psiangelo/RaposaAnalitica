'use client';

import { useSitedata } from '@/lib/useSitedata';
import { getLabels, DEFAULT_LABELS, SITEDATA_KEYS } from '@/lib/sitedata';

/**
 * useLabels — hook reativo que retorna labels customizados.
 *
 * Estrutura: { nav: { home, psicoterapia, ... }, sections: { hero, materials, ... } }
 * Sempre cai no default quando o admin não customizou ou retornou string vazia.
 */
export function useLabels() {
  return useSitedata(getLabels, DEFAULT_LABELS, SITEDATA_KEYS.labels) || DEFAULT_LABELS;
}

/**
 * useSectionLabel — atalho pra pegar o título customizado de uma seção da home.
 * Retorna `fallback` quando vazio ou ausente.
 */
export function useSectionLabel(sectionId, fallback) {
  const labels = useLabels();
  const custom = labels?.sections?.[sectionId];
  return (custom && custom.trim()) || fallback;
}

/**
 * useNavLabel — atalho pra pegar o label customizado de um link da nav.
 */
export function useNavLabel(key, fallback) {
  const labels = useLabels();
  const custom = labels?.nav?.[key];
  return (custom && custom.trim()) || fallback;
}

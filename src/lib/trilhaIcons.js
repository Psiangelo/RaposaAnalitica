/**
 * trilhaIcons — os ícones que o admin escolhe para trilhas e etapas.
 *
 * Na Raposa são os ícones da floresta (src/components/raposa/Icone.jsx).
 * Nomes antigos do Psiangelo (compass, book, scroll…) continuam valendo:
 * o Icone traduz cada um para o equivalente da floresta.
 */
import { ICONE_ROTULO } from '@/components/raposa/Icone';

export const TRILHA_ICON_SLUGS = [
  'torii', 'caminho', 'lanterna', 'montanha', 'ponte', 'arvore', 'bambu', 'lua', 'sol',
  'fogo', 'onda', 'chave', 'olho', 'raposa', 'mascara', 'sakura', 'ginkgo', 'estrela', 'coruja',
];

export const STAGE_ICON_SLUGS = [
  'livro', 'pergaminho', 'pincel', 'olho', 'ouvir', 'caminho', 'lanterna', 'torii', 'ema',
  'leque', 'cha', 'sino', 'carta', 'lupa', 'daruma',
];

export const ALL_ICON_SLUGS = Array.from(new Set([...TRILHA_ICON_SLUGS, ...STAGE_ICON_SLUGS]));

/** O `kind` da etapa → o ícone que aparece quando nenhum foi escolhido. */
export const KIND_TO_ICON = {
  livro: 'livro',
  leitura: 'pergaminho',
  mapa: 'caminho',
  curso: 'torii',
  ensaio: 'pincel',
  video: 'olho',
  extra: 'estrela',
};

export function defaultIconForKind(kind) {
  return KIND_TO_ICON[kind] || 'livro';
}

export const DEFAULT_TRILHA_ICON = 'torii';
export const DEFAULT_STAGE_ICON = 'livro';

export function iconLabel(slug) {
  return ICONE_ROTULO[slug] || slug;
}

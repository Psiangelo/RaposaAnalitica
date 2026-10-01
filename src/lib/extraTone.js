/**
 * extraTone — paleta cerimonial roxa para itens marcados como "Extra".
 *
 * Conceito:
 *   Uma trilha, etapa ou sub-etapa pode ter `extra: true`. Quando isso é
 *   verdade, o accent visual deixa de ser o da área (ouro/terra) e passa
 *   a ser o roxo cerimonial (ametista) — uma cor de "passagem fora do
 *   caminho principal". O ícone canônico do extra é a estrela.
 *
 * Convenção de uso:
 *   import { resolveExtraAccent, isExtra, EXTRA_ICON } from '@/lib/extraTone';
 *
 *   const accent = resolveExtraAccent(trilha, areaColor);
 *   const icon   = isExtra(trilha) ? EXTRA_ICON : (trilha.icon || 'compass');
 */

export const EXTRA_COLOR = '#7A64AE';

export const EXTRA_TONE = {
  color:  EXTRA_COLOR,
  bg:     'rgba(123,94,167,0.14)',
  border: 'rgba(123,94,167,0.40)',
  soft:   'rgba(123,94,167,0.08)',
  label:  'Extra',
};

export const EXTRA_ICON = 'estrela';

export function isExtra(item) {
  return Boolean(item && item.extra === true);
}

/**
 * Retorna o accent (hex string) que o item deve usar:
 *  - extra → cor roxa
 *  - senão → fallback recebido (cor da área)
 */
export function resolveExtraAccent(item, fallback) {
  return isExtra(item) ? EXTRA_COLOR : fallback;
}

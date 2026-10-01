/**
 * areas — categorias de trilhas em /estudos.
 *
 * Cada trilha pertence a uma área (psicologia junguiana, filosofia,
 * antropologia, ...). A área serve como filtro principal do listing
 * (substitui o filtro por nível que existia antes) e como accent
 * de cor / ícone no listing e na detail.
 *
 * O admin gerencia a lista de áreas (label, slug, ícone, cor accent).
 * `id` e `slug` são tratados como sinônimos pra simplificar referência.
 */

export const DEFAULT_AREAS = [
  {
    id: 'psicologia-junguiana',
    slug: 'psicologia-junguiana',
    label: 'Psicologia Junguiana',
    icon: 'spiral',
    color: '#2E5240',
  },
  {
    id: 'filosofia',
    slug: 'filosofia',
    label: 'Filosofia',
    icon: 'mountain',
    color: '#9A7552',
  },
  {
    id: 'antropologia',
    slug: 'antropologia',
    label: 'Antropologia',
    icon: 'tree',
    color: '#A88D5D',
  },
];

export const DEFAULT_AREA_ID = 'psicologia-junguiana';

export function normalizeAreas(stored) {
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_AREAS;
  return stored
    .filter((a) => a && (a.slug || a.id))
    .map((a, i) => ({
      id: a.id ?? a.slug ?? `area-${i}`,
      slug: a.slug ?? a.id ?? `area-${i}`,
      label: a.label ?? 'Área',
      icon: a.icon ?? 'compass',
      color: a.color ?? '#2E5240',
    }));
}

export function findArea(areas, idOrSlug) {
  if (!Array.isArray(areas) || areas.length === 0) return null;
  return (
    areas.find((a) => a.slug === idOrSlug || a.id === idOrSlug) ||
    areas[0] ||
    null
  );
}

/** Garante que `areaId` referencia uma área existente; cai no default da lista. */
export function resolveAreaId(areas, areaId) {
  const found = findArea(areas, areaId);
  return found?.slug || found?.id || DEFAULT_AREA_ID;
}

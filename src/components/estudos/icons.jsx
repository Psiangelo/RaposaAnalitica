import { iconePaths } from '@/components/raposa/Icone';
/**
 * icons.jsx — biblioteca de ícones cerimoniais usados em /estudos.
 *
 * Cada ícone:
 *  - viewBox 24x24, fill=none, stroke=currentColor, strokeWidth dinâmico
 *  - strokeLinecap/Linejoin=round
 *  - Sem 'use client': render puro de SVG, safe em server e client components
 *
 * Quando o `name` não existe, cai no ícone `compass` como fallback silencioso.
 *
 * Uso:
 *   <TrilhaIcon name="compass" size={32} />
 *   <IconSeal name="vessel" size={72} color="#2E5240" />
 */

/* ---------- Trilhas (passagem / arquétipo do caminho) ----------
   Reescritos no estilo Lucide/Feather: traços simples, formas
   reconhecíveis mesmo em 12px, mistura controlada de fill/stroke
   pra dar peso onde faz sentido.
*/

const COMPASS = (
  <>
    <circle cx="12" cy="12" r="9" />
    {/* Agulha bicolor: ponteiro N preenchido, S vazado */}
    <polygon points="12,5 14,12 12,13 10,12" fill="currentColor" />
    <polygon points="12,13 14,12 12,19 10,12" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" />
  </>
);

const SPIRAL = (
  <>
    {/* Espiral aberta: núcleo + 3 arcos crescentes (visível mesmo em 11px) */}
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M 13.5 12 A 3 3 0 0 1 9 14" />
    <path d="M 9 14 A 5.5 5.5 0 0 0 17.5 12" strokeOpacity="0.75" />
    <path d="M 17.5 12 A 8 8 0 0 1 8 5" strokeOpacity="0.5" />
  </>
);

const FLAME = (
  <>
    {/* Chama exterior */}
    <path d="M12 22
             c -4.5 0 -6.5 -3 -6.5 -6.5
             c 0 -3 2 -4.5 3 -6.5
             c 0.3 1.4 1.3 2.2 1.7 3
             c 1.5 -2 1 -4.2 0 -6
             c 4.5 1.3 6 5.3 6 9
             c 0 4 -2.5 7 -4.2 7 z" />
    {/* Chama interna preenchida */}
    <path
      d="M12 19
         c -1.5 0 -2.3 -1.2 -2.3 -2.4
         c 0 -0.9 0.5 -1.5 1 -2.2
         c 0.2 0.5 0.6 0.8 0.8 1.1
         c 0.3 -0.7 0.2 -1.5 -0.1 -2.1
         c 1.5 0.4 2.3 1.8 2.3 3.2
         c 0 1.3 -0.7 2.4 -1.7 2.4 z"
      fill="currentColor"
      fillOpacity="0.35"
    />
  </>
);

const EYE = (
  <>
    <path d="M2 12 c4 -7 16 -7 20 0 c-4 7 -16 7 -20 0 z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
  </>
);

const KEY = (
  <>
    <circle cx="8" cy="12" r="4" />
    <circle cx="8" cy="12" r="1.3" fill="currentColor" />
    <path d="M12 12 L21 12" />
    <path d="M18 12 L18 15" />
    <path d="M21 12 L21 16" />
  </>
);

const MOUNTAIN = (
  <>
    <path d="M3 20 L9 9 L13 15 L17 7 L21 20 Z" />
    <path d="M7.5 14 L9 12.5 L10.5 14" strokeOpacity="0.7" />
    <circle cx="17" cy="9" r="1" fill="currentColor" />
  </>
);

const BRIDGE = (
  <>
    {/* Arco do alto */}
    <path d="M3 13 c3 -7 15 -7 18 0" />
    {/* Pilares */}
    <path d="M4 13 L4 20 M20 13 L20 20" />
    {/* Plataforma */}
    <path d="M3 20 L21 20" />
    {/* Cabos */}
    <path d="M7 13.5 L7 17 M12 8 L12 17 M17 13.5 L17 17" strokeOpacity="0.6" />
  </>
);

const VESSEL = (
  <>
    {/* Taça: copa + haste + base */}
    <path d="M7 4 L17 4 L15.5 10 c0 3 -1.5 4.5 -3.5 4.5 c-2 0 -3.5 -1.5 -3.5 -4.5 Z" />
    <path d="M12 14.5 L12 20" />
    <path d="M8.5 20 L15.5 20" />
    <path d="M9.5 7 L14.5 7" strokeOpacity="0.5" />
  </>
);

const LABYRINTH = (
  <>
    {/* 3 retângulos concêntricos com aberturas (entrada do labirinto) */}
    <path d="M3 3 L21 3 L21 21 L3 21 Z" />
    <path d="M6 6 L6 18 L18 18 L18 6 L13 6" />
    <path d="M9 9 L9 15 L15 15" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </>
);

const SUN = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2 L12 5 M12 19 L12 22" />
    <path d="M2 12 L5 12 M19 12 L22 12" />
    <path d="M5 5 L7.2 7.2 M16.8 16.8 L19 19" />
    <path d="M19 5 L16.8 7.2 M7.2 16.8 L5 19" />
  </>
);

const MOON = (
  <>
    <path d="M20 14
             A 8 8 0 1 1 10 4
             A 6 6 0 0 0 20 14 z" fill="currentColor" fillOpacity="0.12" />
    <path d="M20 14 A 8 8 0 1 1 10 4 A 6 6 0 0 0 20 14 z" />
  </>
);

const TREE = (
  <>
    {/* Copa em 3 bolas + tronco */}
    <circle cx="12" cy="6" r="3" />
    <circle cx="8.5" cy="10" r="3" />
    <circle cx="15.5" cy="10" r="3" />
    <path d="M12 13 L12 22" />
    <path d="M9 22 L15 22" />
  </>
);

const ANCHOR = (
  <>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7 L12 21" />
    <path d="M8 10 L16 10" />
    <path d="M5 16 c0 4 4 5.5 7 5.5 c3 0 7 -1.5 7 -5.5" />
    <path d="M5 16 L3 14 M19 16 L21 14" />
  </>
);

const STAR = (
  <polygon points="12,2.5 14.7,9.5 22,9.7 16.2,14 18.3,21 12,16.8 5.7,21 7.8,14 2,9.7 9.3,9.5" />
);

const GATE = (
  <>
    {/* Portal: silhueta única em path fechado, sem detalhes que somem em 11px */}
    <path d="M5 21 L5 10 A 7 7 0 0 1 19 10 L19 21 Z" />
    <path d="M12 3.5 L12 21" />
  </>
);

const MIRROR = (
  <>
    {/* Espelho oval com base */}
    <ellipse cx="12" cy="9" rx="5.5" ry="6.5" />
    <ellipse cx="12" cy="9" rx="3" ry="4" strokeOpacity="0.4" />
    {/* Haste */}
    <path d="M12 15.5 L12 20" />
    <path d="M8 20 L16 20" />
  </>
);

/* ---------- Etapas (ato / modalidade da prática) ---------- */

const BOOK = (
  <>
    {/* Livro fechado vertical com lombada */}
    <path d="M6 3 L18 3 L18 21 L6 21 Z" />
    <path d="M8 3 L8 21" />
    <path d="M11 7 L15 7 M11 11 L15 11" strokeOpacity="0.6" />
  </>
);

const MAP = (
  <>
    {/* Pin de localização — drop shape com círculo */}
    <path d="M12 22
             c -4 -5 -7 -9 -7 -12
             a 7 7 0 1 1 14 0
             c 0 3 -3 7 -7 12 z" />
    <circle cx="12" cy="10" r="2.5" />
  </>
);

const VIDEO = (
  <>
    <circle cx="12" cy="12" r="9" />
    <polygon points="10.5,8 16.5,12 10.5,16" fill="currentColor" />
  </>
);

const ESSAY = (
  <>
    {/* Folha A4 com dobra superior direita */}
    <path d="M5 3 L15 3 L19 7 L19 21 L5 21 Z" />
    <path d="M15 3 L15 7 L19 7" />
    <path d="M8 12 L16 12 M8 15 L16 15 M8 18 L13 18" strokeOpacity="0.7" />
  </>
);

const QUOTE = (
  <>
    {/* Aspas tipográficas duplas, ambas preenchidas */}
    <path
      d="M5.5 7
         L9.5 7
         L9.5 12
         c 0 2.5 -1.5 4 -3.5 4
         L6 14.5
         c 1 0 1.5 -0.8 1.5 -1.8
         L5.5 12.7
         L5.5 7 z"
      fill="currentColor"
    />
    <path
      d="M14.5 7
         L18.5 7
         L18.5 12
         c 0 2.5 -1.5 4 -3.5 4
         L15 14.5
         c 1 0 1.5 -0.8 1.5 -1.8
         L14.5 12.7
         L14.5 7 z"
      fill="currentColor"
    />
  </>
);

const HEADPHONES = (
  <>
    {/* Arco superior */}
    <path d="M4 14 L4 12 a 8 8 0 0 1 16 0 L20 14" />
    {/* Earcups */}
    <path d="M3 14 L7 14 L7 20 L3 20 Z" />
    <path d="M17 14 L21 14 L21 20 L17 20 Z" />
  </>
);

const CARTOGRAPHY = (
  <>
    {/* Nó central preenchido + 4 satélites + arestas */}
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    <circle cx="5" cy="6" r="1.8" />
    <circle cx="19" cy="6" r="1.8" />
    <circle cx="5" cy="18" r="1.8" />
    <circle cx="19" cy="18" r="1.8" />
    <path
      d="M6.5 7 L10.2 10.5
         M17.5 7 L13.8 10.5
         M6.5 17 L10.2 13.5
         M17.5 17 L13.8 13.5"
      strokeOpacity="0.6"
    />
  </>
);

const RITUAL = (
  <>
    {/* Círculo grande + 4 cruzes nos pontos cardeais + círculo interno */}
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1.5 L12 4.5 M12 19.5 L12 22.5" />
    <path d="M1.5 12 L4.5 12 M19.5 12 L22.5 12" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </>
);

const SCROLL = (
  <>
    {/* Pergaminho com 2 enrolamentos (topo e base) */}
    <path d="M5 5 c0 -1.5 1 -2 2 -2 L17 3 c1 0 2 0.5 2 2" />
    <path d="M5 5 L5 17" />
    <path d="M19 5 L19 17" />
    {/* Topo enrolado */}
    <path d="M3 5 L5 5 M3 5 c 0 -1.5 1 -2 2 -2" />
    {/* Base enrolada */}
    <path d="M5 17 c 0 1.5 1 2 2 2 L17 19 c 1 0 2 -0.5 2 -2" />
    {/* Texto */}
    <path d="M8 9 L16 9 M8 13 L14 13" strokeOpacity="0.5" />
  </>
);

const LANTERN = (
  <>
    {/* Corpo da lanterna em barril */}
    <path d="M8 5 L16 5 L16 8 c 2 1 2 6 0 7 c 0 3 -2 5 -4 5 c -2 0 -4 -2 -4 -5 c -2 -1 -2 -6 0 -7 z" />
    {/* Linhas horizontais */}
    <path d="M8 8 L16 8 M8 15 L16 15" strokeOpacity="0.7" />
    {/* Alça superior + base */}
    <path d="M11 5 L11 3 L13 3 L13 5" />
    <path d="M11 20 L13 20" />
  </>
);

const THRESHOLD = (
  <>
    {/* Porta entreaberta: moldura + porta inclinada */}
    <path d="M4 3 L20 3 L20 21 L4 21 Z" />
    {/* Linha da porta (entreaberta) */}
    <path d="M12 5 L12 20" />
    {/* "Espaço" entre porta e batente */}
    <path d="M14 6 L18 4 M14 19 L18 21" strokeOpacity="0.6" />
    {/* Maçaneta */}
    <circle cx="14" cy="12" r="0.5" fill="currentColor" />
  </>
);

/* ---------- Mapa nome → JSX + rótulo ---------- */

const ICON_PATHS = {
  // Trilhas
  compass: COMPASS,
  spiral: SPIRAL,
  flame: FLAME,
  eye: EYE,
  key: KEY,
  mountain: MOUNTAIN,
  bridge: BRIDGE,
  vessel: VESSEL,
  labyrinth: LABYRINTH,
  sun: SUN,
  moon: MOON,
  tree: TREE,
  anchor: ANCHOR,
  star: STAR,
  gate: GATE,
  mirror: MIRROR,
  // Etapas
  book: BOOK,
  map: MAP,
  video: VIDEO,
  essay: ESSAY,
  quote: QUOTE,
  headphones: HEADPHONES,
  cartography: CARTOGRAPHY,
  ritual: RITUAL,
  scroll: SCROLL,
  lantern: LANTERN,
  threshold: THRESHOLD,
};

export const AVAILABLE_ICONS = Object.keys(ICON_PATHS);

/**
 * <TrilhaIcon name="compass" size={32} strokeWidth={1.5} ariaLabel="..." />
 *
 * Sem 'use client' — pode ser usado em RSC, em rotas SSG, em e-mails de OG, etc.
 * Decorativo por padrão (aria-hidden); passe `ariaLabel` para semantizar.
 */
export default function TrilhaIcon({
  name,
  size = 24,
  strokeWidth,
  className = '',
  style,
  ariaLabel,
}) {
  const paths = iconePaths(name) || ICON_PATHS[name] || iconePaths('torii');
  // Stroke afina sutilmente em tamanhos grandes pra não engrossar visualmente
  const sw = strokeWidth ?? (size >= 64 ? 1.3 : size >= 32 ? 1.5 : 1.6);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-label={ariaLabel || undefined}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : undefined}
    >
      {paths}
    </svg>
  );
}

/**
 * <IconSeal name="vessel" size={72} color="#2E5240" />
 *
 * Wrapper circular pronto pros heros das trilhas/etapas (Bloco 3+).
 * Borda dupla discreta + ícone centralizado. Cor opcional (default currentColor).
 */
export function IconSeal({
  name,
  size = 64,
  color,
  ringWidth = 1.5,
  className = '',
  style,
}) {
  const sealStyle = {
    width: size,
    height: size,
    color: color || 'currentColor',
    borderColor: color ? `${color}66` : 'currentColor',
    boxShadow: color ? `inset 0 0 0 1px ${color}22` : undefined,
    borderWidth: ringWidth,
    ...style,
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border ${className}`}
      style={sealStyle}
    >
      <TrilhaIcon name={name} size={Math.round(size * 0.52)} strokeWidth={1.3} />
    </span>
  );
}

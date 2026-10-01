'use client';

/**
 * PosterCover — tratamento automático pra qualquer imagem de capa.
 *
 * Três camadas:
 *  1. Treatment: gradient escuro + tint dourado (mix-blend-multiply) — puxa
 *     a imagem pra paleta do site sem destruir a cor original.
 *  2. Vignette radial: derrete as bordas no fundo escuro do site.
 *  3. Ornamento geométrico: SVG do kit do site posicionado num canto,
 *     escolhido determinísticamente pelo `seed` (ex. slug do post).
 *
 * Opcional: overlay de título (serif + meta caps + linha dourada)
 * no canto inferior-esquerdo — transforma a capa em "poster" editorial.
 */

import { motion } from 'framer-motion';
import { resolveImageSrc } from '@/lib/basepath';
import { useAmbientMotion } from '@/lib/useAmbientMotion';
import {
  TriangleCompass,
  HexRing,
  QuaternioSigil,
  SpiralAccent,
  VesicaPiscis,
  ConcentricSquares,
  DottedCircle,
} from '@/components/illustrations';

const GEOS = [
  { Comp: TriangleCompass,    size: 96,  opacity: 0.32 },
  { Comp: HexRing,            size: 88,  opacity: 0.3  },
  { Comp: QuaternioSigil,     size: 76,  opacity: 0.42 },
  { Comp: SpiralAccent,       size: 140, opacity: 0.18 },
  { Comp: VesicaPiscis,       size: 120, opacity: 0.22 },
  { Comp: ConcentricSquares,  size: 80,  opacity: 0.32 },
  { Comp: DottedCircle,       size: 80,  opacity: 0.4  },
];

// Hash simples e estável (não usa Math.random; mesma seed → mesmo geo)
function hashSeed(seed) {
  if (!seed) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ASPECT_CLASS = {
  '16/9': 'aspect-[16/9]',
  '16/10': 'aspect-[16/10]',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '2/3': 'aspect-[2/3]',
  '3/4': 'aspect-[3/4]',
  '9/16': 'aspect-[9/16]',
  '1/1': 'aspect-square',
};

/**
 * @param {object} props
 * @param {string} props.src
 * @param {string} [props.alt]
 * @param {string} [props.aspect]         — "16/9" | "16/10" | "4/3" | "3/2" | "1/1"
 * @param {string} [props.seed]           — slug/id pra escolher o geo
 * @param {number} [props.geoIndex]       — força um geo específico (0..6)
 * @param {'tl'|'tr'|'bl'|'br'} [props.geoAt]
 * @param {0|1|2|3} [props.intensity]     — força do treatment (0 = nenhum)
 * @param {boolean} [props.hoverZoom]
 * @param {boolean} [props.titleOverlay]  — renderizar título dentro da capa
 * @param {string}  [props.title]
 * @param {string}  [props.eyebrow]       — meta caps acima do título
 * @param {React.ReactNode} [props.footer]— meta (data, min) abaixo do título
 * @param {string}  [props.className]
 */
export default function PosterCover({
  src,
  alt = '',
  aspect = '16/9',
  seed = '',
  geoIndex,
  geoAt = 'br',
  intensity = 2,
  hoverZoom = true,
  titleOverlay = false,
  title,
  eyebrow,
  footer,
  className = '',
}) {
  const ambient = useAmbientMotion();
  const resolved = resolveImageSrc(src);
  const idx = typeof geoIndex === 'number' ? geoIndex % GEOS.length : hashSeed(seed) % GEOS.length;
  const { Comp: Geo, size: geoSize, opacity: geoOpacity } = GEOS[idx];

  // Posicionamento do ornamento
  const geoPos = {
    tl: 'top-3 left-3 md:top-5 md:left-5',
    tr: 'top-3 right-3 md:top-5 md:right-5',
    bl: 'bottom-3 left-3 md:bottom-5 md:left-5',
    br: 'bottom-3 right-3 md:bottom-5 md:right-5',
  }[geoAt];

  // Intensidade do treatment (gradient escuro + tint dourado)
  const darkOverlay = [
    'opacity-0',
    'opacity-40',
    'opacity-60',
    'opacity-80',
  ][intensity] ?? 'opacity-60';
  const goldTintOpacity = [0, 0.1, 0.18, 0.28][intensity] ?? 0.18;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[rgb(var(--acento-rgb)/0.18)] bg-[#14110E] group ${
        ASPECT_CLASS[aspect] || 'aspect-[16/9]'
      } ${className}`}
    >
      {resolved ? (
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          // Dessatura + leve contraste reduzido pra imagem não brigar com a paleta
          style={{
            filter: intensity >= 2 ? 'saturate(0.55) contrast(0.92) brightness(0.88)'
                  : intensity === 1 ? 'saturate(0.8) brightness(0.95)'
                  : 'none',
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
            hoverZoom ? 'group-hover:scale-[1.04]' : ''
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#14110E] via-[rgb(var(--cartao-rgb))] to-[rgb(var(--fundo-rgb))]" />
      )}

      {/* 1a. Tint dourado via multiply — harmoniza a imagem com a paleta */}
      {intensity > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-multiply"
          style={{
            background: `linear-gradient(135deg, rgba(180,140,80,${goldTintOpacity}) 0%, rgb(var(--acento-rgb)/0) 55%, rgba(14,12,10,${goldTintOpacity * 1.2}) 100%)`,
          }}
        />
      )}

      {/* 1b. Gradient escuro (mais forte embaixo quando há título) */}
      {intensity > 0 && (
        <div
          aria-hidden
          className={`absolute inset-0 pointer-events-none ${darkOverlay}`}
          style={{
            background: titleOverlay
              ? 'linear-gradient(to top, rgb(var(--fundo-rgb)/0.92) 0%, rgb(var(--fundo-rgb)/0.55) 35%, rgb(var(--fundo-rgb)/0.1) 65%, rgb(var(--fundo-rgb)/0.25) 100%)'
              : 'linear-gradient(to top, rgb(var(--fundo-rgb)/0.55) 0%, rgb(var(--fundo-rgb)/0.1) 40%, rgb(var(--fundo-rgb)/0.15) 100%)',
          }}
        />
      )}

      {/* 2. Vignette sutil — suaviza bordas sem escurecer demais */}
      {intensity > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(var(--fundo-rgb)/0) 45%, rgb(var(--fundo-rgb)/0.4) 85%, rgb(var(--fundo-rgb)/0.7) 100%)',
          }}
        />
      )}

      {/* 3. Ornamento geométrico + linha dourada.
             O giro sai em celular: são vários cards por listagem, cada um com um
             loop de animação próprio, e o efeito some atrás da imagem. */}
      <div className={`absolute ${geoPos} pointer-events-none flex flex-col items-end gap-2`}>
        <Geo size={geoSize} opacity={geoOpacity} animated={ambient} className="text-[rgb(var(--acento-rgb))]" />
        {!titleOverlay && (
          <span className="block w-10 h-px bg-[rgb(var(--acento-rgb)/0.6)]" />
        )}
      </div>

      {/* 4. Título sobreposto — vira poster editorial */}
      {titleOverlay && title && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute inset-x-0 bottom-0 p-5 md:p-7 z-10"
        >
          {eyebrow && (
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-6 h-px bg-[rgb(var(--acento-rgb))]" />
              <span className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-[rgb(var(--acento-rgb))]">
                {eyebrow}
              </span>
            </div>
          )}
          <h3 className="font-serif text-[rgb(var(--texto-forte-rgb))] leading-[1.1] text-xl md:text-2xl lg:text-[1.75rem] max-w-[32ch] drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]">
            {title}
          </h3>
          {footer && (
            <div className="mt-3 flex items-center gap-3 flex-wrap text-[0.55rem] font-mono tracking-[0.2em] uppercase text-[rgb(var(--texto-rgb))]">
              {footer}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

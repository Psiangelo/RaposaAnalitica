'use client';

import { motion } from 'framer-motion';
import { img, resolveImageSrc } from '@/lib/basepath';

/**
 * Portrait — retrato editorial do Ângelo.
 *
 * PortraitHero usa a foto real (public/images/angelo-portrait.png),
 * com mandala dourada girando atrás como halo, frame editorial
 * com cantos accent e emblema ψ decorativo no canto inferior direito.
 *
 * PortraitAvatar mantém a versão SVG line-art para footer/avatar
 * pequeno onde foto não cabe bem.
 */

// ---------- Cabelo cacheado volumoso ----------
function CurlyHair({ stroke = '#2E5240', strokeWidth = 1, opacity = 1 }) {
  return (
    <g stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={opacity} strokeLinecap="round">
      {/* Massa volumosa atrás — silhueta */}
      <path
        d="M 50 110
           C 35 95, 30 70, 42 48
           C 50 32, 65 22, 82 18
           C 95 10, 115 8, 132 14
           C 152 18, 170 30, 178 50
           C 188 68, 188 90, 180 108
           C 175 118, 168 124, 160 128"
        strokeWidth={strokeWidth * 1.4}
        opacity="0.85"
      />
      {/* Cachos individuais — espirais */}
      <path d="M 60 50 q 4 -8, 10 -6 q 6 2, 4 10 q -2 6, -10 4 q -6 -2, -4 -8" strokeWidth="0.7" />
      <path d="M 76 38 q 5 -9, 12 -6 q 6 3, 3 11 q -3 7, -11 4 q -6 -2, -4 -9" strokeWidth="0.7" />
      <path d="M 95 28 q 6 -8, 14 -5 q 6 3, 2 11 q -4 7, -12 3 q -6 -3, -4 -9" strokeWidth="0.7" />
      <path d="M 118 26 q 6 -7, 14 -3 q 5 4, 0 11 q -5 6, -12 1 q -5 -4, -2 -9" strokeWidth="0.7" />
      <path d="M 140 32 q 6 -6, 13 -1 q 4 5, -2 11 q -6 5, -12 0 q -4 -5, 1 -10" strokeWidth="0.7" />
      <path d="M 158 46 q 5 -4, 11 1 q 3 5, -3 10 q -6 4, -11 -2 q -3 -5, 3 -9" strokeWidth="0.7" />
      {/* Cachos da frente / franja caída */}
      <path d="M 70 72 q 4 -6, 9 -2 q 4 4, -1 9 q -5 4, -9 -1 q -3 -4, 1 -6" strokeWidth="0.6" />
      <path d="M 88 64 q 4 -5, 10 -1 q 3 5, -3 9 q -6 4, -10 -2 q -2 -3, 3 -6" strokeWidth="0.6" />
      <path d="M 110 58 q 5 -4, 10 0 q 3 5, -3 9 q -6 4, -10 -1" strokeWidth="0.6" />
      <path d="M 132 60 q 4 -3, 9 1 q 3 4, -2 8 q -6 3, -10 -2" strokeWidth="0.6" />
      <path d="M 152 70 q 4 -3, 9 1 q 3 4, -2 8 q -6 3, -10 -2" strokeWidth="0.6" />
      {/* Pontas laterais */}
      <path d="M 50 110 q -4 8, 0 18 q 5 8, 12 6" strokeWidth="0.7" />
      <path d="M 178 100 q 6 8, 5 18 q -2 8, -10 8" strokeWidth="0.7" />
    </g>
  );
}

// ---------- Rosto: oval + traços essenciais ----------
function FaceFeatures({ stroke = '#2E5240', strokeWidth = 0.9 }) {
  return (
    <g stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinecap="round">
      {/* Oval do rosto */}
      <path
        d="M 78 90
           C 75 105, 76 130, 85 150
           C 92 165, 105 172, 115 172
           C 125 172, 138 165, 145 150
           C 154 130, 155 105, 152 90"
        strokeWidth={strokeWidth * 1.1}
      />
      {/* Sobrancelhas */}
      <path d="M 90 110 q 8 -3, 16 0" strokeWidth={strokeWidth * 1.2} />
      <path d="M 124 110 q 8 -3, 16 0" strokeWidth={strokeWidth * 1.2} />
      {/* Olhos baixos / fechados (expressão contemplativa) */}
      <path d="M 92 120 q 6 3, 14 0" />
      <path d="M 124 120 q 6 3, 14 0" />
      {/* Ponte do nariz + narinas */}
      <path d="M 115 122 q -1 12, -3 20 q -1 4, 3 5 q 4 -1, 3 -5 q -2 -8, -3 -20" strokeWidth={strokeWidth * 0.85} />
      {/* Boca leve */}
      <path d="M 108 156 q 7 4, 14 0" />
      {/* Cavanhaque jovem — poucos traços abaixo da boca */}
      <path d="M 110 162 q 1 6, 3 8" strokeWidth="0.5" />
      <path d="M 115 163 q 0 7, 0 9" strokeWidth="0.5" />
      <path d="M 120 162 q -1 6, -3 8" strokeWidth="0.5" />
      <path d="M 105 165 q 2 4, 5 6" strokeWidth="0.4" opacity="0.7" />
      <path d="M 125 165 q -2 4, -5 6" strokeWidth="0.4" opacity="0.7" />
      {/* Bigode esparso */}
      <path d="M 105 152 q 5 -2, 9 -1" strokeWidth="0.4" opacity="0.6" />
      <path d="M 125 152 q -5 -2, -9 -1" strokeWidth="0.4" opacity="0.6" />
      {/* Linha sutil do queixo */}
      <path d="M 102 168 q 13 8, 26 0" strokeWidth="0.5" opacity="0.5" />
      {/* Orelha direita (espectador esquerda) com cruz/brinco */}
      <path d="M 78 130 q -3 8, 1 16" strokeWidth="0.6" />
      {/* Brinco (cruz) na orelha */}
      <g stroke={stroke} strokeWidth="0.7">
        <line x1="76" y1="148" x2="76" y2="155" />
        <line x1="73.5" y1="151" x2="78.5" y2="151" />
      </g>
    </g>
  );
}

// ---------- Pescoço + colar fino ----------
function NeckCollar({ stroke = '#2E5240' }) {
  return (
    <g stroke={stroke} fill="none" strokeLinecap="round">
      {/* Pescoço */}
      <path d="M 102 172 q 0 14, -4 26" strokeWidth="0.85" />
      <path d="M 128 172 q 0 14, 4 26" strokeWidth="0.85" />
      {/* Colar fino */}
      <path d="M 95 198 q 20 14, 40 0" strokeWidth="0.6" opacity="0.9" />
      {/* Pingente ou nó central do colar */}
      <circle cx="115" cy="206" r="1" fill={stroke} />
    </g>
  );
}

// ---------- Camisa aberta no V (gola + botões) ----------
function ShirtCollar({ stroke = '#2E5240', strokeWidth = 0.9 }) {
  return (
    <g stroke={stroke} fill="none" strokeWidth={strokeWidth} strokeLinecap="round">
      {/* Ombros */}
      <path d="M 80 220 q -25 5, -45 22" />
      <path d="M 150 220 q 25 5, 45 22" />
      {/* Gola V — esquerda + direita */}
      <path d="M 98 224 q -2 8, -16 24 q -3 6, -4 12" />
      <path d="M 132 224 q 2 8, 16 24 q 3 6, 4 12" />
      {/* Linhas internas da camisa convergindo pra abertura */}
      <path d="M 115 215 q 0 22, -4 40" strokeWidth="0.55" opacity="0.65" />
      <path d="M 115 215 q 0 22, 4 40" strokeWidth="0.55" opacity="0.65" />
      {/* Botões insinuados na linha central */}
      <circle cx="115" cy="265" r="1.3" fill={stroke} opacity="0.8" />
      <circle cx="115" cy="285" r="1.3" fill={stroke} opacity="0.6" />
      <circle cx="115" cy="305" r="1.3" fill={stroke} opacity="0.45" />
    </g>
  );
}

// ---------- Tatuagem blackwork estilizada (mandala/símbolo) ----------
function TattooMark({ x = 60, y = 270, stroke = '#2E5240' }) {
  return (
    <g transform={`translate(${x},${y})`} stroke={stroke} fill="none" strokeWidth="0.55" strokeLinecap="round">
      <circle cx="0" cy="0" r="14" />
      <circle cx="0" cy="0" r="9" strokeWidth="0.4" />
      <circle cx="0" cy="0" r="3" fill={stroke} fillOpacity="0.5" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        const x1 = Math.cos(a) * 3;
        const y1 = Math.sin(a) * 3;
        const x2 = Math.cos(a) * 14;
        const y2 = Math.sin(a) * 14;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={i % 2 === 0 ? 0.5 : 0.3} />;
      })}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i * 90 * Math.PI) / 180 + Math.PI / 4;
        const x = Math.cos(a) * 9;
        const y = Math.sin(a) * 9;
        return <circle key={`d${i}`} cx={x} cy={y} r="0.7" fill={stroke} />;
      })}
    </g>
  );
}

// ---------- Mandala atrás (halo opcional) ----------
function HaloMandala({ stroke = '#2E5240', opacity = 0.18 }) {
  return (
    <g stroke={stroke} fill="none" opacity={opacity}>
      <circle cx="115" cy="125" r="115" strokeWidth="0.4" />
      <circle cx="115" cy="125" r="95" strokeWidth="0.3" />
      <circle cx="115" cy="125" r="75" strokeWidth="0.5" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const x1 = 115 + Math.cos(a) * 75;
        const y1 = 125 + Math.sin(a) * 75;
        const x2 = 115 + Math.cos(a) * 115;
        const y2 = 125 + Math.sin(a) * 115;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={i % 4 === 0 ? 0.5 : 0.2} />;
      })}
    </g>
  );
}

/* ============================================================
   COMPONENTES PRINCIPAIS
============================================================ */

export function PortraitHero({ className = '', animate = true, src, srcMobile, alt }) {
  return (
    <div className={`relative w-full aspect-[4/5] group ${className}`}>
      {/* Mandala girando atrás (halo dourado fora da foto) */}
      {animate && (
        <motion.svg
          viewBox="0 0 320 400"
          className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] pointer-events-none"
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50% 50%' }}
        >
          <g fill="none" stroke="#2E5240" opacity="0.18">
            <circle cx="160" cy="200" r="180" strokeWidth="0.4" />
            <circle cx="160" cy="200" r="160" strokeWidth="0.3" />
            <circle cx="160" cy="200" r="140" strokeWidth="0.5" />
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i * 15 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={160 + Math.cos(a) * 140}
                  y1={200 + Math.sin(a) * 140}
                  x2={160 + Math.cos(a) * 180}
                  y2={200 + Math.sin(a) * 180}
                  strokeWidth={i % 4 === 0 ? 0.6 : 0.25}
                />
              );
            })}
          </g>
        </motion.svg>
      )}

      {/* Frame da foto.
          <picture> com media query, e não srcset: em celular de tela densa o
          srcset voltaria a escolher o arquivo grande pelo DPR, que é justamente
          o que se quer evitar aqui. */}
      <div className="relative w-full h-full overflow-hidden bg-bg-card border border-border-subtle transition-all duration-700 group-hover:border-accent/30 group-hover:shadow-xl group-hover:shadow-accent/5">
        <picture>
          {srcMobile && (
            <source media="(max-width: 767px)" srcSet={resolveImageSrc(srcMobile)} />
          )}
          <img
            src={src ? resolveImageSrc(src) : img('/images/angelo-portrait.png')}
            alt={alt || 'Ângelo · retrato'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
            fetchPriority="high"
            decoding="async"
            style={{ objectPosition: 'center 20%' }}
          />
        </picture>

        {/* Gradient sutil dourado no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Vinheta inferior pra integrar com o resto da página */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/60 to-transparent pointer-events-none" />

        {/* Emblema decorativo ψ no canto inferior direito —
            cobre 100% qualquer resto da marca d'água que sobre */}
        <div className="absolute bottom-3 right-3 w-12 h-12 flex items-center justify-center pointer-events-none">
          <svg
            width="48" height="48" viewBox="0 0 48 48"
            className="absolute inset-0"
            fill="none" stroke="#2E5240" strokeWidth="0.6"
          >
            <circle cx="24" cy="24" r="22" opacity="0.55" />
            <circle cx="24" cy="24" r="17" opacity="0.4" strokeWidth="0.4" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={24 + Math.cos(a) * 17}
                  y1={24 + Math.sin(a) * 17}
                  x2={24 + Math.cos(a) * 22}
                  y2={24 + Math.sin(a) * 22}
                  strokeWidth={i % 3 === 0 ? 0.55 : 0.25}
                  opacity="0.7"
                />
              );
            })}
          </svg>
          <span
            className="relative font-serif italic text-2xl text-accent leading-none"
            style={{ textShadow: '0 1px 6px rgb(var(--fundo-rgb)/0.9)' }}
          >
            ψ
          </span>
        </div>
      </div>

      {/* Cantos editoriais */}
      <div className="absolute -top-1 -right-1 w-6 h-6 border-t border-r border-accent/30 pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b border-l border-accent/30 pointer-events-none" />

    </div>
  );
}

export function PortraitAvatar({ size = 56, className = '' }) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 230 280" className="w-full h-full" aria-label="Avatar Ângelo">
        <defs>
          <clipPath id="avatar-clip">
            <circle cx="115" cy="125" r="115" />
          </clipPath>
        </defs>
        <g clipPath="url(#avatar-clip)">
          <rect width="230" height="280" fill="#F8F4EA" />
          <CurlyHair stroke="#2E5240" strokeWidth={1.4} />
          <FaceFeatures stroke="#2E5240" strokeWidth={1.1} />
          <NeckCollar stroke="#2E5240" />
        </g>
        <circle cx="115" cy="125" r="115" fill="none" stroke="#2E5240" strokeOpacity="0.4" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

export default PortraitHero;

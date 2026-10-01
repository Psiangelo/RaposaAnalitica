'use client';

/**
 * illustrations — ornamentos SVG reutilizáveis.
 *
 * Todos seguem a paleta editorial (dourado #2E5240, stroke fino,
 * opacidade baixa). Pensados para dar textura visual entre seções
 * sem competir com o conteúdo. Todos aceitam className e size.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// ══════════════════════════════════════════════════════════════════
// StarField — céu estrelado decorativo, animado
// Estrelas piscam (twinkle) E flutuam lentamente em deriva tipo
// correnteza cósmica. Cada estrela tem período/delay próprios,
// então o movimento parece orgânico e não sincronizado.
// Render só após mount (hydration-safe).
// ══════════════════════════════════════════════════════════════════
export function StarField({
  count = 50,
  className = '',
  minSize = 0.6,
  maxSize = 2.4,
  color = '#13211F',
  accentColor = '#2E5240',
  accentChance = 0.22,
  maxOpacity = 0.75,
  twinkle = true,
  glow = true,
  drift = true,
  driftAmount = 40,      // px — amplitude máxima da deriva
  fallBias = 0.6,        // 0-1: quanto a deriva tende a cair (y positivo)
}) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(
      Array.from({ length: count }, (_, i) => {
        const dx = (Math.random() - 0.5) * 2 * driftAmount;
        const dyBase = (Math.random() - 0.5) * 2 * driftAmount;
        // fallBias puxa a deriva pra baixo (y positivo)
        const dy = dyBase * (1 - fallBias) + Math.abs(dyBase) * fallBias;
        return {
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: minSize + Math.random() * (maxSize - minSize),
          color: Math.random() < accentChance ? accentColor : color,
          twinkleDur: 2.6 + Math.random() * 4.4,
          twinkleDelay: Math.random() * 3,
          driftDur: 14 + Math.random() * 18,
          driftDelay: Math.random() * 6,
          dx,
          dy,
          baseOpacity: 0.2 + Math.random() * maxOpacity,
        };
      })
    );
  }, [count, minSize, maxSize, color, accentColor, accentChance, maxOpacity, driftAmount, fallBias]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      {stars.map((s) => {
        const dotStyle = {
          width: s.size,
          height: s.size,
          background: s.color,
          boxShadow: glow ? `0 0 ${s.size * 2.2}px ${s.color}` : undefined,
        };

        // Camada interna — twinkle (opacidade)
        const dot = twinkle ? (
          <motion.span
            className="block rounded-full"
            style={dotStyle}
            animate={{ opacity: [s.baseOpacity * 0.25, s.baseOpacity, s.baseOpacity * 0.25] }}
            transition={{
              duration: s.twinkleDur,
              delay: s.twinkleDelay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ) : (
          <span
            className="block rounded-full"
            style={{ ...dotStyle, opacity: s.baseOpacity }}
          />
        );

        // Camada externa — drift (translate)
        if (!drift) {
          return (
            <span
              key={s.id}
              className="absolute"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              {dot}
            </span>
          );
        }

        return (
          <motion.span
            key={s.id}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            animate={{
              x: [0, s.dx * 0.5, s.dx, s.dx * 0.5, 0],
              y: [0, s.dy * 0.5, s.dy, s.dy * 0.5, 0],
            }}
            transition={{
              duration: s.driftDur,
              delay: s.driftDelay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {dot}
          </motion.span>
        );
      })}
    </div>
  );
}

// Variação "nebula" — poucas estrelas maiores, halo mais forte
export function NebulaField({ count = 14, className = '' }) {
  return (
    <StarField
      count={count}
      className={className}
      minSize={1.6}
      maxSize={4}
      accentChance={0.6}
      maxOpacity={0.45}
      driftAmount={60}
    />
  );
}

// ══════════════════════════════════════════════════════════════════
// ShootingStars — meteoros / estrelas cadentes ocasionais
//
// Cada meteoro tem: (a) um ponto brilhante (cabeça) + (b) uma trilha
// fading atrás dela. Movimento e trilha SEMPRE alinhados — a trilha
// fica exatamente ao longo do vetor de movimento, o que dá a
// percepção correta de "estrela cadente" (em vez de uma barra
// flutuando em direção diferente da que ela aponta).
//
// Cai diagonalmente (padrão: ~28° abaixo da horizontal), começando
// em algum ponto do quadrante superior esquerdo.
// ══════════════════════════════════════════════════════════════════
export function ShootingStars({
  count = 3,
  className = '',
  color = '#13211F',
  accentColor = '#2E5240',
  angleDeg = 28,      // inclinação da queda
  travelPx = 620,     // distância percorrida
}) {
  const [shots, setShots] = useState([]);

  useEffect(() => {
    setShots(
      Array.from({ length: count }, (_, i) => {
        const jitter = (Math.random() - 0.5) * 10;
        const angleFinal = angleDeg + jitter;
        const rad = (angleFinal * Math.PI) / 180;
        const travel = travelPx + Math.random() * 160;
        return {
          id: i,
          startX: 4 + Math.random() * 30,        // quadrante sup-esquerdo
          startY: 2 + Math.random() * 22,
          angleDeg: angleFinal,
          dx: Math.cos(rad) * travel,
          dy: Math.sin(rad) * travel,
          trailLen: 110 + Math.random() * 90,
          duration: 2.4 + Math.random() * 1.4,
          delay: 4 + i * 7 + Math.random() * 10,
          cycle: 16 + Math.random() * 14,
          color: Math.random() < 0.3 ? accentColor : color,
        };
      })
    );
  }, [count, color, accentColor, angleDeg, travelPx]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden
    >
      {shots.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            width: 0,
            height: 0,
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [0, s.dx],
            y: [0, s.dy],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: s.cycle,
            ease: 'easeOut',
            times: [0, 0.08, 0.88, 1],
          }}
        >
          {/* Trilha — estende PARA TRÁS a partir da cabeça, no mesmo ângulo do movimento */}
          <span
            style={{
              position: 'absolute',
              right: 0,
              top: -1,
              width: s.trailLen,
              height: 2,
              borderRadius: '999px',
              background: `linear-gradient(90deg, transparent 0%, ${s.color}00 5%, ${s.color}cc 75%, ${s.color} 95%, #ffffff 100%)`,
              transform: `rotate(${s.angleDeg}deg)`,
              transformOrigin: '100% 50%',
              filter: `drop-shadow(0 0 4px ${s.color})`,
            }}
          />
          {/* Cabeça — ponto luminoso que fica no final da trilha */}
          <span
            style={{
              position: 'absolute',
              right: -2,
              top: -2,
              width: 4,
              height: 4,
              borderRadius: '999px',
              background: '#ffffff',
              boxShadow: `0 0 10px 2px ${s.color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// AlchemyDivider — conjunção Sol e Lua
// Divisor ornamental com dois círculos unidos por linha, evocando
// a coniunctio alquímica. Bom entre seções de conteúdo denso.
// ══════════════════════════════════════════════════════════════════
export function AlchemyDivider({ className = '', opacity = 0.55 }) {
  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/10 to-accent/20" />
      <svg
        width="90"
        height="36"
        viewBox="0 0 90 36"
        className="mx-5 flex-shrink-0"
        style={{ opacity }}
        fill="none"
        stroke="#2E5240"
      >
        {/* Sol à esquerda */}
        <circle cx="18" cy="18" r="8" strokeWidth="0.7" />
        <circle cx="18" cy="18" r="2.2" fill="#2E5240" fillOpacity="0.6" stroke="none" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 18 + Math.cos(angle) * 10;
          const y1 = 18 + Math.sin(angle) * 10;
          const x2 = 18 + Math.cos(angle) * 13;
          const y2 = 18 + Math.sin(angle) * 13;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.6" />;
        })}

        {/* Linha de união */}
        <line x1="32" y1="18" x2="58" y2="18" strokeWidth="0.4" strokeDasharray="1 1.5" />

        {/* Lua à direita */}
        <path
          d="M 78 10 A 8 8 0 1 0 78 26 A 6 6 0 1 1 78 10 Z"
          strokeWidth="0.7"
          fill="#2E5240"
          fillOpacity="0.2"
        />
      </svg>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-accent/10 to-accent/20" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// QuaternioSigil — selo quaternário (símbolo do Self)
// 4 círculos equidistantes de um centro com linhas conectando em cruz.
// Pode ser divisor compacto ou accent dentro da seção.
// ══════════════════════════════════════════════════════════════════
export function QuaternioSigil({ className = '', size = 56, opacity = 0.5, animated = true }) {
  const Wrap = animated ? motion.svg : 'svg';
  const wrapProps = animated
    ? {
        animate: { rotate: 360 },
        transition: { duration: 180, repeat: Infinity, ease: 'linear' },
      }
    : {};
  return (
    <Wrap
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      {...wrapProps}
    >
      <circle cx="32" cy="32" r="28" strokeWidth="0.4" />
      <circle cx="32" cy="32" r="3" fill="#2E5240" fillOpacity="0.8" stroke="none" />
      <line x1="32" y1="8" x2="32" y2="56" strokeWidth="0.35" />
      <line x1="8" y1="32" x2="56" y2="32" strokeWidth="0.35" />
      <circle cx="32" cy="8" r="3" fill="#2E5240" fillOpacity="0.6" strokeWidth="0.5" />
      <circle cx="56" cy="32" r="3" fill="#2E5240" fillOpacity="0.6" strokeWidth="0.5" />
      <circle cx="32" cy="56" r="3" fill="#2E5240" fillOpacity="0.6" strokeWidth="0.5" />
      <circle cx="8" cy="32" r="3" fill="#2E5240" fillOpacity="0.6" strokeWidth="0.5" />
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════════════════
// SpiralAccent — espiral logarítmica
// Accent para canto de seção (posicionar com absolute).
// ══════════════════════════════════════════════════════════════════
export function SpiralAccent({ className = '', size = 180, opacity = 0.15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.6"
    >
      <path d="M 100 100 m -80 0 a 80 80 0 1 1 160 0 a 70 70 0 1 1 -140 0 a 60 60 0 1 1 120 0 a 50 50 0 1 1 -100 0 a 40 40 0 1 1 80 0 a 30 30 0 1 1 -60 0 a 20 20 0 1 1 40 0 a 12 12 0 1 1 -24 0 a 6 6 0 1 1 12 0" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// BranchOrnament — ramos finos simétricos
// Bom como ornamento acima de um título ou entre blocos de texto.
// ══════════════════════════════════════════════════════════════════
export function BranchOrnament({ className = '', opacity = 0.5 }) {
  return (
    <svg
      width="120"
      height="24"
      viewBox="0 0 120 24"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.5"
      strokeLinecap="round"
    >
      {/* Haste central */}
      <line x1="60" y1="2" x2="60" y2="22" strokeWidth="0.4" />
      {/* Folhas à esquerda */}
      <path d="M 60 6 Q 48 6, 42 2" />
      <path d="M 60 10 Q 44 12, 36 10" />
      <path d="M 60 14 Q 42 16, 34 18" />
      <path d="M 60 18 Q 48 20, 40 22" />
      {/* Folhas à direita */}
      <path d="M 60 6 Q 72 6, 78 2" />
      <path d="M 60 10 Q 76 12, 84 10" />
      <path d="M 60 14 Q 78 16, 86 18" />
      <path d="M 60 18 Q 72 20, 80 22" />
      {/* Centro marcado */}
      <circle cx="60" cy="12" r="1.5" fill="#2E5240" fillOpacity="0.6" stroke="none" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// DiamondChain — 3 losangos encadeados
// Divisor mais enxuto que a mandala, bom para transições curtas.
// ══════════════════════════════════════════════════════════════════
export function DiamondChain({ className = '', opacity = 0.55 }) {
  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/10 to-accent/20" />
      <svg
        width="80"
        height="16"
        viewBox="0 0 80 16"
        className="mx-5 flex-shrink-0"
        style={{ opacity }}
        fill="none"
        stroke="#2E5240"
        strokeWidth="0.7"
      >
        <path d="M 10 8 L 18 2 L 26 8 L 18 14 Z" />
        <path d="M 32 8 L 40 2 L 48 8 L 40 14 Z" fill="#2E5240" fillOpacity="0.25" />
        <path d="M 54 8 L 62 2 L 70 8 L 62 14 Z" />
      </svg>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-accent/10 to-accent/20" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// OrbitalAccent — círculos orbitais (canto de seção)
// Para fundos; versão pequena de uma mandala, posicionar absolute.
// ══════════════════════════════════════════════════════════════════
export function OrbitalAccent({ className = '', size = 240, opacity = 0.08 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      animate={{ rotate: 360 }}
      transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="120" cy="120" r="110" strokeWidth="0.35" />
      <circle cx="120" cy="120" r="85" strokeWidth="0.45" />
      <circle cx="120" cy="120" r="55" strokeWidth="0.6" />
      <circle cx="120" cy="120" r="25" strokeWidth="0.7" />
      {/* Órbitas elípticas decorativas */}
      <ellipse cx="120" cy="120" rx="105" ry="60" strokeWidth="0.3" transform="rotate(30 120 120)" />
      <ellipse cx="120" cy="120" rx="105" ry="60" strokeWidth="0.3" transform="rotate(-30 120 120)" />
      {/* Pontos em órbita */}
      <circle cx="225" cy="120" r="2.5" fill="#2E5240" fillOpacity="0.8" stroke="none" />
      <circle cx="15" cy="120" r="2" fill="#2E5240" fillOpacity="0.6" stroke="none" />
      <circle cx="120" cy="15" r="2" fill="#2E5240" fillOpacity="0.5" stroke="none" />
    </motion.svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// VesicaPiscis — dois círculos sobrepostos (símbolo sagrado junguiano)
// Accent de canto. Evoca a interseção consciente/inconsciente.
// ══════════════════════════════════════════════════════════════════
export function VesicaPiscis({ className = '', size = 160, opacity = 0.14, animated = true }) {
  const Wrap = animated ? motion.svg : 'svg';
  const wrapProps = animated
    ? {
        animate: { rotate: [0, 5, 0, -5, 0] },
        transition: { duration: 30, repeat: Infinity, ease: 'easeInOut' },
      }
    : {};
  return (
    <Wrap
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.6"
      {...wrapProps}
    >
      <circle cx="45" cy="60" r="32" />
      <circle cx="75" cy="60" r="32" />
      <line x1="60" y1="28" x2="60" y2="92" strokeWidth="0.35" strokeDasharray="1 2" />
      <circle cx="60" cy="60" r="1.8" fill="#2E5240" fillOpacity="0.7" stroke="none" />
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════════════════
// HexRing — hexágono com pontos nos vértices
// ══════════════════════════════════════════════════════════════════
export function HexRing({ className = '', size = 84, opacity = 0.22, animated = true }) {
  const Wrap = animated ? motion.svg : 'svg';
  const wrapProps = animated
    ? {
        animate: { rotate: 360 },
        transition: { duration: 220, repeat: Infinity, ease: 'linear' },
      }
    : {};
  const verts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * (Math.PI / 180);
    return { x: 50 + Math.cos(a) * 38, y: 50 + Math.sin(a) * 38 };
  });
  const d = verts.map((v, i) => `${i === 0 ? 'M' : 'L'}${v.x} ${v.y}`).join(' ') + ' Z';
  return (
    <Wrap
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      {...wrapProps}
    >
      <circle cx="50" cy="50" r="46" strokeWidth="0.3" />
      <path d={d} strokeWidth="0.55" />
      {verts.map((v, i) => (
        <circle
          key={i}
          cx={v.x}
          cy={v.y}
          r="2"
          fill="#2E5240"
          fillOpacity={i % 2 === 0 ? 0.8 : 0.4}
          stroke="none"
        />
      ))}
      <circle cx="50" cy="50" r="3" fill="#2E5240" fillOpacity="0.6" stroke="none" />
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════════════════
// ConcentricSquares — quadrados encadeados rotacionados
// Accent geométrico, bom para cantos internos.
// ══════════════════════════════════════════════════════════════════
export function ConcentricSquares({ className = '', size = 72, opacity = 0.2, animated = true }) {
  const Wrap = animated ? motion.svg : 'svg';
  const wrapProps = animated
    ? {
        animate: { rotate: 360 },
        transition: { duration: 140, repeat: Infinity, ease: 'linear' },
      }
    : {};
  return (
    <Wrap
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.55"
      {...wrapProps}
    >
      <rect x="10" y="10" width="80" height="80" />
      <rect x="10" y="10" width="80" height="80" transform="rotate(45 50 50)" />
      <rect x="24" y="24" width="52" height="52" strokeWidth="0.4" />
      <rect x="24" y="24" width="52" height="52" transform="rotate(45 50 50)" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="4" fill="#2E5240" fillOpacity="0.7" stroke="none" />
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════════════════
// TriangleCompass — triângulo equilátero com pontos nos vértices
// ══════════════════════════════════════════════════════════════════
export function TriangleCompass({ className = '', size = 90, opacity = 0.25, inverted = false, animated = false }) {
  const Wrap = animated ? motion.svg : 'svg';
  const wrapProps = animated
    ? {
        animate: { rotate: inverted ? -360 : 360 },
        transition: { duration: 200, repeat: Infinity, ease: 'linear' },
      }
    : {};
  const p1 = inverted ? '50,88' : '50,12';
  const p2 = inverted ? '12,22' : '12,78';
  const p3 = inverted ? '88,22' : '88,78';
  return (
    <Wrap
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.6"
      {...wrapProps}
    >
      <circle cx="50" cy="50" r="46" strokeWidth="0.3" />
      <polygon points={`${p1} ${p2} ${p3}`} />
      {[p1, p2, p3].map((p, i) => {
        const [x, y] = p.split(',').map(Number);
        return (
          <circle key={i} cx={x} cy={y} r="2.2" fill="#2E5240" fillOpacity="0.7" stroke="none" />
        );
      })}
      <circle cx="50" cy="50" r="2.5" fill="#2E5240" fillOpacity="0.5" stroke="none" />
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════════════════
// GoldenArc — arco tipo proporção áurea (curva elegante)
// Muito bom para cantos superiores/inferiores de seções.
// ══════════════════════════════════════════════════════════════════
export function GoldenArc({ className = '', size = 180, opacity = 0.14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.55"
    >
      {/* Arcos concêntricos crescentes */}
      <path d="M 20 180 A 160 160 0 0 1 180 20" />
      <path d="M 40 180 A 140 140 0 0 1 180 40" strokeWidth="0.4" />
      <path d="M 60 180 A 120 120 0 0 1 180 60" strokeWidth="0.35" />
      <path d="M 80 180 A 100 100 0 0 1 180 80" strokeWidth="0.3" />
      <path d="M 100 180 A 80 80 0 0 1 180 100" strokeWidth="0.25" strokeDasharray="2 2" />
      {/* Marca de canto */}
      <circle cx="180" cy="180" r="3" fill="#2E5240" fillOpacity="0.6" stroke="none" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// DottedCircle — círculo pontilhado (não linha cheia)
// ══════════════════════════════════════════════════════════════════
export function DottedCircle({ className = '', size = 70, opacity = 0.3, dots = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity }}
      fill="none"
    >
      {Array.from({ length: dots }).map((_, i) => {
        const angle = (i / dots) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 44;
        const y = 50 + Math.sin(angle) * 44;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 4 === 0 ? 1.8 : 1}
            fill="#2E5240"
            fillOpacity={i % 4 === 0 ? 0.8 : 0.4}
          />
        );
      })}
      <circle cx="50" cy="50" r="22" stroke="#2E5240" strokeWidth="0.35" strokeDasharray="1 2" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// GlyphTrio — 3 glifos alquímicos alinhados (Sal, Enxofre, Mercúrio)
// Bom como ornamento inline acima de um label.
// ══════════════════════════════════════════════════════════════════
export function GlyphTrio({ className = '', opacity = 0.65 }) {
  return (
    <svg
      width="96"
      height="20"
      viewBox="0 0 96 20"
      className={className}
      style={{ opacity }}
      fill="none"
      stroke="#2E5240"
      strokeWidth="0.7"
    >
      {/* Sal — círculo cortado */}
      <circle cx="14" cy="10" r="6" />
      <line x1="8" y1="10" x2="20" y2="10" strokeWidth="0.5" />
      {/* Enxofre — triângulo sobre cruz */}
      <path d="M 48 5 L 54 15 L 42 15 Z" />
      <line x1="48" y1="15" x2="48" y2="18" />
      <line x1="46" y1="17" x2="50" y2="17" strokeWidth="0.5" />
      {/* Mercúrio — círculo com chifres e cruz */}
      <circle cx="82" cy="10" r="3.5" />
      <path d="M 78 6 Q 78 3, 82 3 Q 86 3, 86 6" strokeWidth="0.6" />
      <line x1="82" y1="13.5" x2="82" y2="17" />
      <line x1="80" y1="16" x2="84" y2="16" strokeWidth="0.5" />
    </svg>
  );
}

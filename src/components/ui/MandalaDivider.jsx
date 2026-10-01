'use client';

import { motion } from 'framer-motion';
import { useAmbientMotion } from '@/lib/useAmbientMotion';

export default function MandalaDivider({ size = 64, opacity = 0.35, spin = true, className = '' }) {
  // Em celular a mandala fica parada: gira em 60s, quase não se percebe, e o
  // loop de animação custa o mesmo que um que se percebe.
  const ambient = useAmbientMotion();
  const spinning = spin && ambient;

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/15 to-accent/25" />
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="mx-6 flex-shrink-0"
        style={{ opacity }}
        animate={spinning ? { rotate: 360 } : undefined}
        transition={spinning ? { duration: 60, repeat: Infinity, ease: 'linear' } : undefined}
      >
        <g fill="none" stroke="#2E5240" strokeWidth="0.6">
          <circle cx="32" cy="32" r="28" strokeWidth="0.4" />
          <circle cx="32" cy="32" r="20" />
          <circle cx="32" cy="32" r="12" />
          <circle cx="32" cy="32" r="4" fill="#2E5240" fillOpacity="0.5" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 32 + Math.cos(angle) * 12;
            const y1 = 32 + Math.sin(angle) * 12;
            const x2 = 32 + Math.cos(angle) * 28;
            const y2 = 32 + Math.sin(angle) * 28;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={i % 3 === 0 ? 0.7 : 0.35} />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180 + Math.PI / 8;
            const x = 32 + Math.cos(angle) * 20;
            const y = 32 + Math.sin(angle) * 20;
            return <circle key={`p${i}`} cx={x} cy={y} r="0.8" fill="#2E5240" />;
          })}
        </g>
      </motion.svg>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-accent/15 to-accent/25" />
    </div>
  );
}

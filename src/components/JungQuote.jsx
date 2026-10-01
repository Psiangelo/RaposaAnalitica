'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AmbientVideo from '@/components/ui/AmbientVideo';
import { jungQuotes } from '@/data/quotes';

/**
 * JungQuote — bloco de citação rotativa.
 *
 * Props:
 *   variant: 'block' (padrão, entre seções) | 'footer' (compacto, para rodapé)
 *   rotate: se true, troca a cada `rotateMs` ms (default 18s)
 *   rotateMs: intervalo de rotação
 */
export default function JungQuote({ variant = 'block', rotate = true, rotateMs = 18000 }) {
  const [i, setI] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // escolha inicial aleatória apenas depois da hidratação
    setI(Math.floor(Math.random() * jungQuotes.length));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!rotate || !mounted) return;
    const t = setInterval(() => {
      setI((n) => (n + 1) % jungQuotes.length);
    }, rotateMs);
    return () => clearInterval(t);
  }, [rotate, rotateMs, mounted]);

  const q = jungQuotes[i];

  if (variant === 'footer') {
    return (
      <div className="relative text-center font-serif italic text-text-dim/70 text-[0.88rem] leading-relaxed max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.6 }}
          >
            <p>“{q.text}”</p>
            <p className="mt-2 font-mono not-italic text-[0.55rem] tracking-[0.12em] text-accent/60 uppercase">
              {q.source}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <section className="relative py-20 md:py-28 px-5 sm:px-6 md:px-12 overflow-hidden">
      {/* Faixa de respiro: uma vela no escuro atrás da citação. O clipe é quase
          todo preto, então o texto continua legível sem scrim pesado. */}
      <AmbientVideo src="/video/quote.mp4" poster="/video/quote.jpg" opacity={0.72} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 50%, rgb(var(--fundo-rgb)/0.66) 0%, rgb(var(--fundo-rgb)/0.93) 72%)',
        }}
      />

      {/* decoração sutil: aspas gigantes */}
      <span
        aria-hidden
        className="absolute -top-10 left-4 md:left-20 font-serif text-[16rem] leading-none text-accent/[0.05] pointer-events-none select-none"
      >
        “
      </span>

      <div className="relative max-w-[900px] mx-auto text-center">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-serif italic text-[clamp(1.25rem,2.4vw,1.8rem)] leading-[1.4] text-text-bright">
              {q.text}
            </p>
            <footer className="mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-accent/40" />
              <cite className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-accent not-italic">
                C. G. Jung · {q.source}
              </cite>
              <span className="h-px w-8 bg-accent/40" />
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
    </section>
  );
}

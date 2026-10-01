'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * BackToTop — botão flutuante que aparece depois de ~800px de scroll.
 * Posicionado no canto inferior esquerdo pra não conflitar com o WhatsApp
 * (canto direito). Respeita safe-area. Escondido em /admin.
 */
const HIDDEN_ROUTES = ['/admin'];

export default function BackToTop() {
  const pathname = usePathname() || '';
  const hidden = HIDDEN_ROUTES.some((r) => pathname.includes(r));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hidden) return;
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [hidden]);

  if (hidden) return null;

  const goTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={goTop}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
          data-reading-hide="true"
          className="fixed left-5 z-[120] w-11 h-11 rounded-full bg-bg-card border border-border-hover text-text-dim hover:text-accent hover:border-accent/60 shadow-lg shadow-black/30 transition-colors flex items-center justify-center bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] focus-visible:outline-2 focus-visible:outline focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

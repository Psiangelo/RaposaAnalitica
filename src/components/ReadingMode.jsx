'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * ReadingMode — toggle que ativa um modo foco para leitura.
 * Adiciona a classe `reading-mode` no <body>; CSS em globals esconde
 * navbar, TOC e controles. Mostra botão "Sair" flutuante.
 *
 * Acessibilidade:
 *   - ESC sai do modo leitura (equivale ao botão "Sair")
 *   - Foco visível com outline no accent (keyboard users)
 *   - Foco volta pro botão "Modo leitura" depois de sair
 */
export default function ReadingMode() {
  const [active, setActive] = useState(false);
  const [montado, setMontado] = useState(false);
  const triggerRef = useRef(null);

  // o botão de sair vai por portal para o <body>; ver o comentário lá embaixo
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const body = document.body;
    if (active) body.classList.add('reading-mode');
    else body.classList.remove('reading-mode');
    return () => body.classList.remove('reading-mode');
  }, [active]);

  // ESC pra sair; só registra enquanto ativo
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setActive(false);
        // devolve foco pro trigger pra não perder o lugar na tab order
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setActive(true)}
        aria-label="Ativar modo leitura"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-[1.5px] border-linha bg-bg-card text-text-bright font-sans text-[14px] font-semibold hover:border-[var(--acento)] hover:text-accent transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
        <span>Modo leitura</span>
      </button>

      {/* ⚠️ Portal obrigatório, não é preciosismo. Este componente é montado
          dentro da barra de ações do post, que leva data-reading-hide="true" e
          portanto vira `display:none` justamente quando o modo leitura liga.
          Um elemento position:fixed dentro de um ancestral com display:none não
          é renderizado, então o botão de sair sumia com o pai: no desktop dava
          pra sair pelo ESC, mas no celular não havia ESC nem botão, e o único
          jeito de sair era recarregar a página. */}
      {montado && createPortal(
        <AnimatePresence>
          {active && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setActive(false)}
              aria-label="Sair do modo leitura (ESC)"
              title="ESC"
              className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-5 z-[150] inline-flex items-center gap-2 px-5 py-3 rounded-full bg-mata hover:bg-[var(--cedro)] text-[var(--washi)] font-sans text-[14px] font-semibold shadow-lg transition-colors"
              autoFocus
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
              Sair leitura
            </motion.button>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

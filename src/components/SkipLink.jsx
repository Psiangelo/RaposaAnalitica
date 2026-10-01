'use client';

/**
 * SkipLink — primeiro focável da página. Invisível até receber foco por tab.
 * Clica e foca o primeiro <main> do documento (WCAG 2.4.1).
 */
export default function SkipLink() {
  const focusMain = (e) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (!main) return;
    // tabIndex -1 deixa foco programático sem entrar na tab order
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: false });
    main.scrollIntoView({ block: 'start' });
  };

  return (
    <a
      href="#main"
      onClick={focusMain}
      className="skip-link font-sans text-[14px] font-semibold bg-mata text-[var(--washi)] px-5 py-3"
    >
      Pular para o conteúdo
    </a>
  );
}

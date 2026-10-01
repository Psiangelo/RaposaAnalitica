'use client';

/**
 * PullQuote — destaque editorial de citação. Substitui o padrão de
 * <blockquote> simples por algo com peso visual: borda dourada,
 * aspas decorativas, attribution discreta abaixo.
 *
 * Variants:
 *   default → borda esquerda + aspas decorativas grandes (compacto)
 *   wide    → centralizado fullwidth, ideal pra meio de artigo longo
 */
export default function PullQuote({
  children,
  cite,
  source,
  variant = 'default',
  className = '',
}) {
  if (variant === 'wide') {
    return (
      <figure className={`relative my-16 max-w-3xl mx-auto text-center ${className}`}>
        <span
          className="absolute -top-8 left-1/2 -translate-x-1/2 font-serif italic text-[5rem] leading-none text-accent select-none pointer-events-none"
          style={{ opacity: 0.18 }}
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="font-serif italic text-[clamp(1.3rem,2.4vw,1.8rem)] text-text-bright leading-[1.45] tracking-[-0.005em]">
          {children}
        </blockquote>
        {(cite || source) && (
          <figcaption className="mt-6 flex items-center justify-center gap-3 font-sans text-[12.5px] font-semibold text-accent tracking-[0.12em] uppercase">
            <span className="block w-8 h-px bg-accent/40" />
            {cite && <cite className="not-italic">{cite}</cite>}
            {source && (
              <span className="text-text-dim normal-case font-serif italic tracking-normal text-[0.78rem]">
                {source}
              </span>
            )}
            <span className="block w-8 h-px bg-accent/40" />
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`relative my-12 pl-8 border-l-2 border-accent/40 ${className}`}>
      <span
        className="absolute -left-3 -top-4 font-serif italic text-[3.5rem] leading-none text-accent/20 select-none pointer-events-none"
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="font-serif italic text-[1.2rem] text-text-bright leading-relaxed mb-3">
        {children}
      </blockquote>
      {(cite || source) && (
        <figcaption className="font-sans text-[12.5px] font-semibold text-accent tracking-[0.12em] uppercase not-italic">
          {cite && <cite className="not-italic">— {cite}</cite>}
          {source && (
            <span className="ml-2 text-text-dim normal-case font-serif italic tracking-normal text-[0.78rem]">
              {source}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

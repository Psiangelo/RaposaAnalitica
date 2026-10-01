/** Rótulo (eyebrow) da Raposa: Barlow em caixa alta, com o fogo-de-raposa na frente. */
export default function Rotulo({ children, className = '', cor = 'text-accent', ponto = true, as: Tag = 'p' }) {
  return (
    <Tag className={`font-sans text-[12px] font-semibold uppercase tracking-[0.2em] ${cor} flex items-center gap-2 ${className}`}>
      {ponto && <span aria-hidden="true" className="inline-block w-[7px] h-[7px] rounded-full bg-torii" />}
      <span>{children}</span>
    </Tag>
  );
}

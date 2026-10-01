/**
 * Selo — o hanko vermelho da marca, com o texto em duas linhas.
 * Também serve para o locus de uma citação (OC 13 §241).
 */
export default function Selo({ linhas = ['RAPOSA', 'ANALÍTICA'], tamanho = 64, cor = 'var(--torii)', className = '', girar = -4 }) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center text-center font-serif font-extrabold leading-[1.02] select-none ${className}`}
      style={{
        width: tamanho,
        height: tamanho,
        background: cor,
        color: 'var(--washi)',
        borderRadius: Math.round(tamanho * 0.09),
        transform: `rotate(${girar}deg)`,
        boxShadow: 'inset 0 0 0 3px rgb(242 235 220 / 0.32)',
        fontSize: Math.round(tamanho * 0.165),
        letterSpacing: '0.05em',
        fontVariationSettings: '"SOFT" 100, "WONK" 0',
      }}
      aria-hidden="true"
    >
      {linhas.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </span>
  );
}

/** O selo do locus, inclinado, para citações: «OC 13 §241». */
export function SeloLocus({ children, className = '' }) {
  return (
    <span
      className={`inline-block font-sans text-[11px] font-semibold tracking-[0.12em] uppercase px-2 py-[3px] rounded-[3px] ${className}`}
      style={{ background: 'var(--torii)', color: 'var(--washi)', transform: 'rotate(-2deg)' }}
    >
      {children}
    </span>
  );
}

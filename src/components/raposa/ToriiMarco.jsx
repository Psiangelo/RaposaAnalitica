/**
 * ToriiMarco — o marco de uma etapa no caminho dos mil torii.
 *   estado: 'vazio' (não começou) · 'curso' (a próxima) · 'feito' (concluída)
 * Vermelho cheio quando concluída, contorno vermelho quando é a próxima,
 * contorno apagado quando ainda não.
 */
export default function ToriiMarco({ estado = 'vazio', tamanho = 28, cor = 'var(--torii)', className = '' }) {
  const feito = estado === 'feito';
  const curso = estado === 'curso';
  const traco = feito || curso ? cor : 'rgb(var(--texto-dim-rgb) / 0.55)';
  const preench = feito ? cor : 'none';
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* kasagi (viga de cima, pontas viradas) */}
      <path d="M2.5 7.2c4.2 1.9 22.8 1.9 27 0l-.6 3.1c-4.4 1.1-21.4 1.1-25.8 0z" fill={feito ? 'var(--tinta)' : preench} stroke={traco} strokeWidth="1.4" strokeLinejoin="round" />
      {/* nuki (viga de baixo) */}
      <rect x="5" y="14" width="22" height="2.6" rx=".6" fill={preench} stroke={traco} strokeWidth="1.4" />
      {/* pilares */}
      <rect x="8.2" y="10.6" width="3" height="18.6" rx=".7" fill={preench} stroke={traco} strokeWidth="1.4" />
      <rect x="20.8" y="10.6" width="3" height="18.6" rx=".7" fill={preench} stroke={traco} strokeWidth="1.4" />
      {curso && <circle cx="16" cy="22.5" r="2.2" fill={cor} />}
    </svg>
  );
}

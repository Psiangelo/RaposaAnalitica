/**
 * Padronagem — um fundo de wagara tom sobre tom, que preenche o pai.
 * O pai precisa ser `relative` (e de preferência `overflow-hidden`).
 *
 *   <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.12} />
 */
import { wagaraStyle } from '@/lib/wagara';

export default function Padronagem({ nome = 'seigaiha', cor = '#2E5240', opacidade = 0.12, tam = 48, larg = 1.6, className = '', style }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ ...wagaraStyle(nome, cor, opacidade, tam, larg), ...style }}
    />
  );
}

/**
 * Figura — uma figura do banco da Raposa (public/raposa/<grupo>/<nome>.webp).
 *
 * As medidas vêm de src/data/figuras.json (gerado por scripts/assets_raposa.py),
 * para o navegador reservar o espaço antes da imagem chegar e a página não
 * pular. Por padrão carrega só quando aparece na tela.
 *
 *   <Figura nome="fig/raposa-lanterna" className="w-48" />
 */
import { BASE_PATH } from '@/lib/site';
import FIGURAS from '@/data/figuras.json';

export function figuraSrc(nome) {
  if (!nome) return '';
  if (/^(https?:|data:)/.test(nome)) return nome;
  if (nome.startsWith('/')) return `${BASE_PATH}${nome}`;
  return `${BASE_PATH}/raposa/${nome}.webp`;
}

export default function Figura({ nome, alt = '', className = '', style, prioridade = false, ...resto }) {
  const dims = FIGURAS[nome];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={figuraSrc(nome)}
      alt={alt}
      width={dims?.[0]}
      height={dims?.[1]}
      loading={prioridade ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={prioridade ? 'high' : undefined}
      draggable={false}
      className={`select-none ${className}`}
      style={{ height: 'auto', ...style }}
      {...resto}
    />
  );
}

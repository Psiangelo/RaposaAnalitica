import Link from 'next/link';
import Rotulo from '@/components/raposa/Rotulo';
import Icone from '@/components/raposa/Icone';

export const FRAUNCES = { fontVariationSettings: '"SOFT" 100, "WONK" 1' };

/** «Da *clareira*» → { antes: 'Da', pivo: 'clareira', depois: '' } */
export function partirTitulo(texto = '') {
  const m = String(texto).match(/^(.*?)\*([^*]+)\*(.*)$/);
  if (!m) return { antes: texto, pivo: '', depois: '' };
  return { antes: m[1].trim(), pivo: m[2].trim(), depois: m[3].trim() };
}

/** Título de seção com o pivô em itálico vermelho: «Da *clareira*». */
export function TituloSecao({ antes, pivo, depois, texto, as: Tag = 'h2', className = '', tamanho = 'text-[clamp(2.1rem,4.6vw,3.6rem)]' }) {
  if (texto) ({ antes, pivo, depois } = partirTitulo(texto));
  return (
    <Tag className={`font-serif ${tamanho} leading-[1.02] font-bold tracking-[-0.015em] text-text-bright ${className}`} style={FRAUNCES}>
      {antes}
      {antes && pivo ? ' ' : ''}
      {pivo && <em className="italic font-semibold text-accent-bright">{pivo}</em>}
      {depois ? ` ${depois}` : ''}
    </Tag>
  );
}

/**
 * Cabeçalho de seção: rótulo, título, lead opcional e um link à direita
 * («todos os ensaios →»).
 */
export default function Cabecalho({ rotulo, antes, pivo, depois, texto, lead, link, linkLabel, className = '', centro = false }) {
  return (
    <div className={`flex flex-col gap-5 ${centro ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'} ${className}`}>
      <div className={centro ? 'max-w-[760px]' : 'max-w-[720px]'}>
        {rotulo && <Rotulo className={`mb-4 ${centro ? 'justify-center' : ''}`}>{rotulo}</Rotulo>}
        <TituloSecao antes={antes} pivo={pivo} depois={depois} texto={texto} />
        {lead && <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[58ch]">{lead}</p>}
      </div>
      {link && (
        <Link href={link} className="link-arrow shrink-0">
          {linkLabel} <Icone nome="seta" size={16} />
        </Link>
      )}
    </div>
  );
}

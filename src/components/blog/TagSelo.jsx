'use client';

import Link from 'next/link';
import { wagaraStyle, estiloDaTag } from '@/lib/wagara';
import { slugifyTag } from '@/lib/tagSlug';
import { useSitedata } from '@/lib/useSitedata';
import { getTagEstilos, SITEDATA_KEYS } from '@/lib/sitedata';

/**
 * Selo de uma tag: a cor e a padronagem dela (escolhidas no painel, ou fixas
 * pelo nome). Fica igual em todo lugar onde a tag aparece.
 */
export default function TagSelo({ tag, link = false, tamanho = 'md', className = '' }) {
  const mapa = useSitedata(getTagEstilos, {}, SITEDATA_KEYS.tagEstilos);
  if (!tag) return null;
  const { padrao, cor } = estiloDaTag(tag, mapa);
  const cls = `relative inline-flex items-center overflow-hidden rounded-full font-sans font-semibold uppercase tracking-[0.14em] text-[var(--washi)] ${
    tamanho === 'sm' ? 'text-[10.5px] px-2.5 py-[3px]' : 'text-[11.5px] px-3 py-1'
  } ${className}`;
  const conteudo = (
    <>
      <span aria-hidden className="absolute inset-0" style={{ background: cor }} />
      <span aria-hidden className="absolute inset-0" style={wagaraStyle(padrao, '#F2EBDC', 0.28, 18, 1.4)} />
      <span className="relative">{tag}</span>
    </>
  );
  return link ? (
    <Link href={`/blog/tag/${slugifyTag(tag)}/`} className={`${cls} hover:brightness-110`}>
      {conteudo}
    </Link>
  ) : (
    <span className={cls}>{conteudo}</span>
  );
}

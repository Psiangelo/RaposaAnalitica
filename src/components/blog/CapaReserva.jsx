'use client';

import { wagaraStyle, estiloDaTag } from '@/lib/wagara';
import { useSitedata } from '@/lib/useSitedata';
import { getTagEstilos, SITEDATA_KEYS } from '@/lib/sitedata';
import Figura from '@/components/raposa/Figura';

const KAMONS = ['raposa', 'ginkgo', 'bordo', 'lua-nuvem', 'ondas', 'bambu', 'sakura', 'glicinia', 'tomoe', 'suzu'];

function hash(s = '') {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Capa de reserva: para ensaio sem imagem. A cor e a padronagem da primeira
 * tag, um kamon (brasão) escolhido pelo título e um disco atrás; nunca uma
 * imagem genérica.
 */
export default function CapaReserva({ post, className = '' }) {
  const mapa = useSitedata(getTagEstilos, {}, SITEDATA_KEYS.tagEstilos);
  const tag = post?.tags?.[0] || 'Ensaio';
  const { padrao, cor } = estiloDaTag(tag, mapa);
  const kamon = KAMONS[hash(post?.slug || post?.title) % KAMONS.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: cor }} aria-hidden="true">
      <div className="absolute inset-0" style={wagaraStyle(padrao, '#F2EBDC', 0.18, 44, 1.6)} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62%] aspect-square rounded-full"
        style={{ background: 'rgb(242 235 220 / 0.14)' }}
      />
      <Figura
        nome={`kamon/${kamon}-claro`}
        alt=""
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42%] opacity-90"
      />
    </div>
  );
}

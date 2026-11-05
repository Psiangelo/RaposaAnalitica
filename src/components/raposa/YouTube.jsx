'use client';

import { getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';
import { BASE_PATH } from '@/lib/site';
import Icone from '@/components/raposa/Icone';

/**
 * O canal do YouTube em destaque na /bio, logo depois do «Apoie a Raposa».
 *
 * A capa é o próprio banner do canal («a raposa que dorme debaixo da mata»),
 * para quem chega no YouTube reconhecer a casa. A parte de baixo é a noite do
 * banner continuando no cartão. O botão de play fica na mata, abaixo do nome,
 * para não tapar o título da arte.
 *
 * O link mora em Configurações (settings.youtubeLink); o liga/desliga é a
 * chave «youtube» da Visibilidade.
 */

const FRAUNCES = { fontVariationSettings: '"SOFT" 100, "WONK" 1' };

export function useYouTube() {
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const { visibility: v } = useVisibility();
  const link = String(settings.youtubeLink || DEFAULT_SETTINGS.youtubeLink || '').trim();
  return { link, ativo: Boolean(link) && v.youtube !== false };
}

/** O endereço sem o https:// e sem o www, para mostrar por extenso. */
function semProtocolo(link) {
  return link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/** O cartão da /bio. */
export function YouTubeDestaque() {
  const { link, ativo } = useYouTube();
  if (!ativo) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-[20px] border-2 border-[var(--tinta)] bg-[var(--noite)] text-[var(--washi)] shadow-[5px_5px_0_var(--tinta)] transition-[transform,box-shadow] duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_var(--tinta)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--tinta)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-[var(--tinta)] bg-[var(--noite)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/images/canal-youtube.webp`}
          alt="A arte do canal: uma raposa gigante dormindo debaixo da mata, com as nove caudas abertas, a lua cheia e o nome Raposa Analítica no céu"
          width={1024}
          height={576}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--torii)] px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--washi)] shadow-[2px_2px_0_var(--tinta)]">
          <Icone nome="youtube" size={14} /> No YouTube
        </span>
        {/* o play, na mata, abaixo do nome do canal */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[79%] flex h-[46px] w-[66px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[14px] border-2 border-[var(--tinta)] bg-[var(--torii)] text-[var(--washi)] shadow-[3px_3px_0_var(--tinta)] transition-transform duration-300 group-hover:scale-110"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M8.5 5.8v12.4L18.5 12z" />
          </svg>
        </span>
      </div>
      <div className="flex items-end gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[1.3rem] font-bold leading-[1.15]" style={FRAUNCES}>
            Meus vídeos sobre <em className="italic font-semibold text-[var(--ginkgo)]">Jung</em>
          </p>
          <p className="mt-1 font-body text-[0.95rem] leading-snug text-[rgb(242_235_220/0.82)]">
            Um tema por vez, com animação e com as palavras do próprio Jung.
          </p>
          <p className="mt-1.5 font-sans text-[12.5px] text-[rgb(242_235_220/0.55)]">{semProtocolo(link)}</p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 pb-0.5 font-sans text-[14px] font-semibold text-[var(--kitsunebi)]">
          Assistir <Icone nome="externo" size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}

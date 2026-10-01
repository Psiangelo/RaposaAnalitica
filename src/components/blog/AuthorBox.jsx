'use client';

import Link from 'next/link';
import {
  getBio, DEFAULT_BIO, getBlogAuthorCta, DEFAULT_BLOG_AUTHOR_CTA, getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS,
} from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

/** Caixa de autor no fim de cada ensaio. */
export default function AuthorBox() {
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const cta = useSitedata(getBlogAuthorCta, DEFAULT_BLOG_AUTHOR_CTA, SITEDATA_KEYS.blogAuthorCta);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const { visibility: v } = useVisibility();
  const a = bio?.author || DEFAULT_BIO.author;
  return (
    <aside className="mt-14 rounded-[24px] border border-linha bg-bg-card p-6 sm:p-7 grid grid-cols-[84px_1fr] sm:grid-cols-[104px_1fr] gap-5 items-start" data-reading-hide="true">
      <div className="relative w-[84px] h-[84px] sm:w-[104px] sm:h-[104px] rounded-full bg-[var(--kaki)] overflow-hidden">
        <div className="absolute inset-[7%] rounded-full bg-[var(--papel-velho)]" />
        <Figura nome="fig/perfil-raposa-oculos" alt="" className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[88%]" />
      </div>
      <div>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-text-dim">Quem escreve</p>
        <p className="font-serif text-[1.45rem] font-bold text-text-bright leading-tight" style={FRAUNCES}>{a.name}</p>
        {a.credential && <p className="font-sans text-[13.5px] text-text-dim">{a.credential}</p>}
        <p className="mt-2.5 font-body text-[1rem] leading-relaxed text-text">{a.bio}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {cta?.label && cta?.href && (
            <Link href={cta.href} className="btn btn--solid btn--sm">
              {cta.label}
            </Link>
          )}
          {v.autorInstagram !== false && settings.instagramLink && (
            <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
              <Icone nome="instagram" size={16} /> Instagram
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}

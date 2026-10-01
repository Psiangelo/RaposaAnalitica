'use client';

import Link from 'next/link';
import { getBio, DEFAULT_BIO, getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';
import Figura from '@/components/raposa/Figura';
import Rotulo from '@/components/raposa/Rotulo';
import Icone from '@/components/raposa/Icone';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

/**
 * «Quem escreve»: fecha a lista de ensaios e a das trilhas. A raposa de
 * óculos no disco, o nome, duas linhas e os caminhos (sobre, Instagram).
 */
export default function AuthorBand({ id = 'quem-escreve', eyebrow = 'Quem escreve', body, secondary }) {
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const { visibility: v } = useVisibility();
  const a = bio?.author || DEFAULT_BIO.author;
  return (
    <section id={id} className="py-16 sm:py-20" data-reading-hide="true">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-[var(--fundo-2)] grid sm:grid-cols-[200px_1fr] gap-6 sm:gap-10 items-center p-6 sm:p-10">
          <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] mx-auto rounded-full bg-[var(--kaki)] overflow-hidden">
            <div className="absolute inset-[7%] rounded-full bg-[var(--papel-velho)]" />
            <Figura nome="fig/perfil-raposa-oculos" alt={a.photo?.alt || 'A raposa de óculos e cachimbo'} className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[86%]" />
          </div>
          <div>
            <Rotulo className="mb-3">{eyebrow}</Rotulo>
            <p className="font-serif text-[2rem] font-bold leading-tight text-text-bright" style={FRAUNCES}>
              {a.name} <span className="italic font-semibold text-accent-bright">· a raposa</span>
            </p>
            {a.credential && <p className="font-sans text-[14px] text-text-dim mt-1">{a.credential}</p>}
            <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-text max-w-[60ch]">{body || a.bio}</p>
            <div className="btn-row mt-6">
              <Link href="/sobre" className="btn btn--solid btn--sm">
                Sobre a raposa <Icone nome="seta" size={16} />
              </Link>
              {secondary && (
                <Link href={secondary.href} className="btn btn--ghost btn--sm">{secondary.label}</Link>
              )}
              {v.autorInstagram !== false && settings.instagramLink && (
                <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                  <Icone nome="instagram" size={16} /> Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

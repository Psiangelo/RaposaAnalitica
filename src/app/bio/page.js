'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getBio, DEFAULT_BIO, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { resolveImageSrc } from '@/lib/basepath';
import { useVisibility } from '@/lib/useVisibility';
import HiddenPlaceholder from '@/components/HiddenPlaceholder';
import { inferBioIcon } from '@/components/bio/BioCardIcons';
import { bioAccent } from '@/components/bio/BioAccents';
import Icone from '@/components/raposa/Icone';
import Figura from '@/components/raposa/Figura';
import { Mascarinha } from '@/components/raposa/Marca';
import Padronagem from '@/components/raposa/Padronagem';

/**
 * /bio — o link do Instagram. A raposa de óculos no alto e os links como
 * ema (as plaquinhas de madeira dos santuários), penduradas por fitinha,
 * cada uma com o ícone e a cor escolhidos no painel.
 */
function externo(href) {
  return /^(https?:)?\/\//.test(href || '') || /^(mailto|tel):/.test(href || '');
}

function Ema({ link, i }) {
  const cor = bioAccent(link.accent, i);
  const icone = inferBioIcon(link);
  const Tag = externo(link.href) ? 'a' : Link;
  const extra = externo(link.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const imagem = resolveImageSrc(link.image);
  return (
    <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i + 0.15 }} className="relative pt-5">
      {/* a fitinha */}
      <span aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 w-[46px] h-[24px] border-[3px] border-b-0 rounded-t-full" style={{ borderColor: 'var(--torii)' }} />
      <Tag
        href={link.href || '#'}
        {...extra}
        className="group relative flex items-center gap-4 rounded-[16px_16px_14px_14px] px-4 py-3.5 shadow-[0_3px_0_rgb(107_74_53/0.45)] hover:-translate-y-0.5 hover:rotate-[-0.6deg] transition-transform"
        style={{ background: cor.flat, color: cor.texto, clipPath: 'polygon(0 18%, 50% 0, 100% 18%, 100% 100%, 0 100%)', paddingTop: '1.6rem' }}
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 overflow-hidden" style={{ background: cor.media1, color: cor.media2 }}>
          {imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagem} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icone nome={icone} size={24} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-[1.18rem] font-bold leading-tight" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            {link.label}
          </span>
          {link.description && <span className="block font-sans text-[13.5px] leading-snug opacity-80">{link.description}</span>}
        </span>
        <Icone nome={externo(link.href) ? 'externo' : 'seta'} size={18} className="opacity-60 group-hover:opacity-100 shrink-0" />
      </Tag>
    </motion.li>
  );
}

export default function BioPage() {
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const { visibility, ready } = useVisibility();
  if (ready && visibility.bio === false) return <HiddenPlaceholder title="Bio indisponível" />;
  const links = (bio.links || []).filter((l) => !l.hidden && l.label);
  const avatar = resolveImageSrc(bio.avatar);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--fundo)]">
      <div className="absolute inset-x-0 top-0 h-[300px] bg-[var(--mata)] overflow-hidden">
        <Padronagem nome="seigaiha" cor="#F2EBDC" opacidade={0.08} tam={44} />
        <div aria-hidden className="ceu-estrelado absolute inset-0" />
        <Figura nome="arvore/ramagem-sakura-dir" alt="" prioridade className="absolute -right-8 -top-2 w-[240px] opacity-90" />
      </div>
      <div className="relative max-w-[460px] mx-auto px-4 pt-14 pb-20">
        <header className="text-center">
          <div className="relative mx-auto w-[150px] h-[150px] rounded-full bg-[var(--kaki)] p-[6px] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[var(--papel-velho)] flex items-end justify-center">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={bio.name} className="w-[92%] h-auto" />
              ) : (
                <Mascarinha tamanho={120} />
              )}
            </div>
          </div>
          <h1 className="mt-5 font-serif text-[2.2rem] font-extrabold leading-tight text-text-bright" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            {bio.name}
          </h1>
          {bio.tagline && <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">{bio.tagline}</p>}
          {bio.bio && <p className="mt-3 font-body text-[1.02rem] leading-relaxed text-text">{bio.bio}</p>}
        </header>

        <ul className="mt-8 space-y-3.5">
          {links.map((l, i) => (
            <Ema key={`${l.href}-${i}`} link={l} i={i} />
          ))}
        </ul>

        <footer className="mt-12 flex flex-col items-center gap-3 text-center">
          <Figura nome="fig/raposa-dormindo" alt="" className="w-[110px]" />
          <Link href="/" className="font-sans text-[14px] font-semibold text-accent hover:underline">
            raposa analítica · o site
          </Link>
        </footer>
      </div>
    </main>
  );
}

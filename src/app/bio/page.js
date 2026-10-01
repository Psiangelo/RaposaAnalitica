'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getBio, DEFAULT_BIO, getSettings, DEFAULT_SETTINGS, getBlogPosts, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { resolveImageSrc } from '@/lib/basepath';
import { useVisibility } from '@/lib/useVisibility';
import { ordenarPublicados, capaDoPost, hrefDoPost, tempoDeLeitura } from '@/lib/ensaios';
import HiddenPlaceholder from '@/components/HiddenPlaceholder';
import { inferBioIcon } from '@/components/bio/BioCardIcons';
import { bioAccent } from '@/components/bio/BioAccents';
import Icone from '@/components/raposa/Icone';
import Figura, { figuraSrc } from '@/components/raposa/Figura';
import { Mascarinha } from '@/components/raposa/Marca';
import Padronagem from '@/components/raposa/Padronagem';

/**
 * /bio — o link do Instagram.
 *
 * No alto, uma noite de verão: cortina de glicínias, vaga-lumes e a raposa de
 * óculos fazendo de lua, com uma nuvem passando. Embaixo, no papel, o último
 * ensaio em destaque e os links como gravuras: carimbo com o ícone, a cor
 * escolhida no painel, sombra chapada de impressão e uma padronagem tom sobre
 * tom que nasce na ponta direita de cada placa. Fecha com a raposa dormindo
 * na lua.
 */

const FRAUNCES = { fontVariationSettings: '"SOFT" 100, "WONK" 1' };

/** Cada cor de placa ganha a sua padronagem. */
const PADRAO = {
  mata: 'asanoha', torii: 'shippo', ai: 'seigaiha', musgo: 'kikko', ouro: 'kanoko',
  noite: 'sazanami', kaki: 'uroko', ume: 'shippo', fuji: 'tatewaku', madeira: 'hishi',
};

const DEGRADE = 'linear-gradient(90deg, transparent 38%, #000 100%)';

function externo(href) {
  return /^(https?:)?\/\//.test(href || '') || /^(mailto|tel):/.test(href || '');
}

function Placa({ link, i }) {
  const cor = bioAccent(link.accent, i);
  const escura = cor.value === 'noite';
  const icone = inferBioIcon(link);
  const fora = externo(link.href);
  const Tag = fora ? 'a' : Link;
  const extra = fora ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const imagem = resolveImageSrc(link.image);
  return (
    <motion.li initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.25, duration: 0.4 }}>
      <Tag
        href={link.href || '#'}
        {...extra}
        className="group relative flex items-center gap-4 overflow-hidden rounded-[18px] border-2 px-4 py-[0.9rem] shadow-[4px_4px_0_var(--placa-sombra)] transition-[transform,box-shadow] duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--placa-sombra)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--placa-sombra)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ background: cor.flat, color: cor.texto, borderColor: cor.media1, '--placa-sombra': cor.media1 }}
      >
        <Padronagem
          nome={PADRAO[cor.value] || 'seigaiha'}
          cor={escura ? '#6DB5AE' : cor.media1}
          opacidade={escura ? 0.2 : 0.16}
          tam={30}
          style={{ maskImage: DEGRADE, WebkitMaskImage: DEGRADE }}
        />
        <span
          className="relative flex items-center justify-center w-[52px] h-[52px] rounded-[14px] shrink-0 overflow-hidden -rotate-[5deg] transition-transform duration-300 group-hover:rotate-0"
          style={{ background: cor.media1, color: cor.media2 }}
        >
          {imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagem} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icone nome={icone} size={26} />
          )}
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block font-serif text-[1.2rem] font-bold leading-tight" style={FRAUNCES}>
            {link.label}
          </span>
          {link.description && <span className="mt-0.5 block font-sans text-[13.5px] leading-snug opacity-80">{link.description}</span>}
        </span>
        <span
          className="relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 border-[1.5px] transition-colors duration-200 group-hover:bg-[var(--placa-sombra)] group-hover:text-[var(--placa-icone)]"
          style={{ borderColor: cor.media1, '--placa-icone': cor.media2 }}
        >
          <Icone nome={fora ? 'externo' : 'seta'} size={16} />
        </span>
      </Tag>
    </motion.li>
  );
}

function Destaque({ post }) {
  const capa = resolveImageSrc(capaDoPost(post, 'horizontal'));
  const min = tempoDeLeitura(post.content_html || post.content);
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
      <Link
        href={hrefDoPost(post)}
        className="group block overflow-hidden rounded-[20px] border-2 border-[var(--tinta)] bg-[var(--cartao)] shadow-[5px_5px_0_var(--tinta)] transition-[transform,box-shadow] duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_var(--tinta)]"
      >
        <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-[var(--tinta)] bg-[var(--nevoa)]">
          {capa && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capa} alt={post.featured_image_alt || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--torii)] px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--washi)] shadow-[2px_2px_0_var(--tinta)]">
            <Icone nome="pincel" size={13} /> {post.pinned ? 'Em destaque' : 'Último ensaio'}
          </span>
        </div>
        <div className="flex items-end gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[1.3rem] font-bold leading-[1.15] text-text-bright" style={FRAUNCES}>{post.title}</p>
            <p className="mt-1 font-sans text-[13px] text-text-dim">{min} min de leitura</p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 font-sans text-[14px] font-semibold text-accent">
            Ler <Icone nome="seta" size={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function Rede({ href, nome, rotulo }) {
  if (!href) return null;
  const fora = externo(href);
  return (
    <a
      href={href}
      {...(fora ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={rotulo}
      title={rotulo}
      className="flex items-center justify-center w-11 h-11 rounded-full border-[1.5px] border-[rgb(242_235_220/0.35)] text-[var(--washi)] transition-colors hover:bg-[var(--washi)] hover:text-[var(--noite)]"
    >
      <Icone nome={nome} size={19} />
    </a>
  );
}

export default function BioPage() {
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const posts = useSitedata(getBlogPosts, [], SITEDATA_KEYS.blog);
  const { visibility, ready } = useVisibility();
  const ultimo = useMemo(() => ordenarPublicados(posts)[0], [posts]);
  if (ready && visibility.bio === false) return <HiddenPlaceholder title="Bio indisponível" />;

  const links = (bio.links || []).filter((l) => !l.hidden && l.label);
  const avatar = resolveImageSrc(bio.avatar);
  const palavras = String(bio.name || '').trim().split(/\s+/);
  const ultimaPalavra = palavras.length > 1 ? palavras.pop() : '';
  const whats = settings.whatsappNumber ? `https://wa.me/${String(settings.whatsappNumber).replace(/\D/g, '')}` : '';
  const email = settings.emailAddress ? `mailto:${settings.emailAddress}` : '';
  const mostrarDestaque = bio.destaqueEnsaio !== false && ultimo;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--fundo)]">
      {/* ------------------------------------------------ a noite */}
      <header className="relative overflow-hidden bg-[var(--noite)] text-[var(--washi)]">
        <Padronagem nome="seigaiha" cor="#F2EBDC" opacidade={0.05} tam={46} />
        <div aria-hidden className="ceu-estrelado absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[84px] sm:h-[112px] bg-repeat-x"
          style={{ backgroundImage: `url(${figuraSrc('arvore/glicinia-pergolado')})`, backgroundSize: 'auto 100%', backgroundPosition: 'center top' }}
        />
        <Figura nome="mata/vaga-lumes" alt="" prioridade className="pointer-events-none absolute -left-12 top-[118px] w-[118px] opacity-80 sm:left-[4%] sm:top-[150px] sm:w-[210px]" />
        <Figura nome="mata/vaga-lumes" alt="" prioridade className="pointer-events-none absolute -right-12 top-[96px] w-[112px] opacity-70 -scale-x-100 sm:right-[5%] sm:top-[250px] sm:w-[190px]" />
        {/* lanternas penduradas na pérgola (só no computador) */}
        {['left-[13%]', 'right-[13%] [animation-delay:-2.2s]'].map((lado) => (
          <div key={lado} aria-hidden className={`pointer-events-none hidden md:flex absolute top-0 ${lado} flex-col items-center origin-top balanca`}>
            <span className="w-[2px] h-[92px] bg-[var(--tinta)]" />
            <Figura nome="obj/chochin" alt="" prioridade className="-mt-1 w-[54px]" />
          </div>
        ))}

        <div className="relative max-w-[480px] mx-auto px-4 pt-[104px] sm:pt-[136px] text-center">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative mx-auto w-[164px] h-[164px]">
            <div aria-hidden className="absolute -inset-[22px] rounded-full bg-[var(--ginkgo)] opacity-[0.13]" />
            <div aria-hidden className="absolute -inset-[44px] rounded-full bg-[var(--ginkgo)] opacity-[0.06]" />
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--lua)] ring-[5px] ring-[var(--ginkgo)] flex items-end justify-center">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={bio.name} className="w-[94%] h-auto" />
              ) : (
                <Mascarinha tamanho={130} />
              )}
            </div>
            <Figura nome="mata/kumo" alt="" prioridade className="pointer-events-none absolute -left-[58px] -bottom-[6px] w-[128px]" />
          </motion.div>

          <h1 className="mt-7 font-serif text-[2.6rem] sm:text-[3rem] font-extrabold leading-[1] tracking-[-0.015em]" style={FRAUNCES}>
            {palavras.join(' ')}
            {ultimaPalavra && (
              <>
                {' '}
                <em className="italic font-bold text-[var(--ginkgo)]">{ultimaPalavra}</em>
              </>
            )}
          </h1>
          {bio.tagline && (
            <p className="mt-3 inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--kitsunebi)]">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[var(--torii)]" />
              {bio.tagline}
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[var(--torii)]" />
            </p>
          )}
          {bio.bio && <p className="mt-4 mx-auto max-w-[36ch] font-body italic text-[1.06rem] leading-relaxed text-[rgb(242_235_220/0.86)]">{bio.bio}</p>}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Rede href={settings.instagramLink} nome="instagram" rotulo="Instagram" />
            <Rede href={whats} nome="whatsapp" rotulo="WhatsApp" />
            <Rede href={email} nome="email" rotulo="E-mail" />
          </div>
        </div>

        {/* o morro onde a noite encontra o papel */}
        <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative block w-full h-[64px] sm:h-[92px] mt-8">
          <path d="M0 62 C 170 26 330 24 520 54 C 700 84 860 34 1040 40 C 1220 46 1320 76 1440 58 L1440 120 L0 120 Z" fill="var(--cedro)" opacity="0.7" />
          <path d="M0 94 C 220 60 420 68 640 90 C 860 112 1080 66 1260 74 C 1350 78 1400 88 1440 86 L1440 120 L0 120 Z" fill="var(--fundo)" />
        </svg>
      </header>

      {/* ------------------------------------------------ o papel */}
      <Figura nome="arvore/bambuzal" alt="" className="pointer-events-none hidden lg:block absolute bottom-0 left-[max(0px,calc(50%-640px))] w-[250px] opacity-90" />
      <Figura nome="arvore/sakura-dir" alt="" className="pointer-events-none hidden lg:block absolute bottom-0 right-[max(-40px,calc(50%-680px))] w-[400px]" />
      <div className="relative max-w-[480px] mx-auto px-4 pb-14">
        {mostrarDestaque && <Destaque post={ultimo} />}

        <ul className={`${mostrarDestaque ? 'mt-7' : 'mt-1'} space-y-4`}>
          {links.map((l, i) => (
            <Placa key={`${l.href}-${i}`} link={l} i={i} />
          ))}
        </ul>

        <footer className="mt-14 flex flex-col items-center text-center">
          <div className="relative w-[176px] h-[176px] rounded-full overflow-hidden bg-[var(--noite)] ring-4 ring-[var(--papel-velho)]">
            <div aria-hidden className="ceu-estrelado absolute inset-0" />
            <Figura nome="fig/raposa-dormindo-lua" alt="A raposa dormindo enrolada na lua" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[46%] w-[78%]" />
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-full border-2 border-[var(--mata)] font-sans text-[14px] font-semibold text-[var(--mata)] transition-colors hover:bg-[var(--mata)] hover:text-[var(--washi)]"
          >
            Entrar na floresta inteira <Icone nome="seta" size={16} />
          </Link>
          <p className="mt-4 font-sans text-[12px] text-text-dim">© {new Date().getFullYear()} {bio.name || 'Raposa Analítica'}</p>
        </footer>
      </div>
    </main>
  );
}

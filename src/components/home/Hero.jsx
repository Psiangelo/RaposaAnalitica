'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import Figura from '@/components/raposa/Figura';
import Rotulo from '@/components/raposa/Rotulo';
import Icone from '@/components/raposa/Icone';
import { SeloLocus } from '@/components/raposa/Selo';
import { FRAUNCES } from '@/components/raposa/Cabecalho';
import { BASE_PATH } from '@/lib/site';

/**
 * Abertura da home: a floresta (OC 13 §241). O texto à esquerda; à direita
 * um disco da mata com a raposa da lanterna, que guia, e os fogos-de-raposa
 * flutuando. Bambuzal na borda, padronagem de folhas tom sobre tom no papel.
 */
function Fogo({ x, y, tam, atraso, cor = 'azul' }) {
  const reduz = useReducedMotion();
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width: tam }}
      animate={reduz ? undefined : { y: [0, -10, 0], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: atraso }}
    >
      <Figura nome={`mata/fogo-${cor}`} alt="" className="w-full" />
    </motion.div>
  );
}

export default function Hero() {
  const home = useSitedata(getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS.homepage);
  const h = { ...DEFAULT_HOMEPAGE.hero, ...(home?.hero || {}) };

  return (
    <section className="relative overflow-hidden pt-[var(--nav-h)]">
      {/* papel com folhas tom sobre tom */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `url(${BASE_PATH}/raposa/folhas/bambu-escura.webp)`,
          backgroundSize: '616px 770px',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 75%, transparent 100%)',
        }}
      />
      {/* a cerejeira entra pelo canto: flores rosadas (as creme somem no
          papel), pendurada do alto da página (o corte do desenho fica fora da tela) e só no computador, onde não
          passa por cima do título */}
      <Figura
        nome="arvore/ramagem-sakura-dir-rosa"
        alt=""
        prioridade
        className="pointer-events-none absolute -right-6 top-0 hidden lg:block lg:w-[400px] xl:w-[440px]"
      />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-14 pb-20 lg:pb-24 grid lg:grid-cols-[1.08fr_1fr] gap-10 lg:gap-6 items-center">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Rotulo className="mb-6">{h.eyebrow}</Rotulo>
            <h1
              className="font-serif text-[clamp(2.9rem,7.4vw,6.2rem)] leading-[0.95] font-extrabold tracking-[-0.025em] text-text-bright"
              style={FRAUNCES}
            >
              {h.titlePrefix}{' '}
              <em className="italic font-bold text-accent-bright">{h.titleEmphasis}</em>
            </h1>
            {h.tagline && (
              <p className="mt-3 font-serif italic text-[clamp(1.4rem,2.6vw,2rem)] text-accent font-medium" style={FRAUNCES}>
                {h.tagline}
              </p>
            )}
            {h.lead && <p className="mt-6 font-body text-[1.12rem] sm:text-[1.2rem] leading-relaxed text-text max-w-[46ch]">{h.lead}</p>}
            <div className="btn-row mt-8">
              {h.primaryLabel && (
                <Link href={h.primaryHref || '/blog'} className="btn btn--solid btn--lg">
                  <Icone nome="pincel" size={18} /> {h.primaryLabel}
                </Link>
              )}
              {h.secondaryLabel && (
                <Link href={h.secondaryHref || '/trilhas'} className="btn btn--ghost btn--lg">
                  <Icone nome="torii" size={18} /> {h.secondaryLabel}
                </Link>
              )}
            </div>
          </motion.div>

          {h.quote && (
            <motion.figure
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-10 relative max-w-[520px] rounded-[6px] bg-[var(--lua)] px-6 py-5 border-x-[7px] border-[var(--tronco)] shadow-[0_14px_30px_-24px_rgb(19_33_31/0.6)]"
            >
              <blockquote className="font-body italic text-[0.98rem] leading-relaxed text-text">“{h.quote}”</blockquote>
              {h.quoteSource && (
                <figcaption className="mt-2.5">
                  <SeloLocus>{h.quoteSource}</SeloLocus>
                </figcaption>
              )}
            </motion.figure>
          )}
        </div>

        {/* a arte */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-[560px] aspect-square"
        >
          <div className="absolute inset-[4%] rounded-full bg-mata" />
          <div className="absolute inset-[14%] rounded-full bg-[var(--cedro)]" />
          <div
            aria-hidden
            className="absolute left-[38%] top-[44%] w-[40%] aspect-square rounded-full"
            style={{ background: 'radial-gradient(circle, rgb(233 200 94 / 0.55) 0%, rgb(233 200 94 / 0) 70%)' }}
          />
          <Figura
            nome="arvore/bambuzal"
            alt=""
            prioridade
            className="absolute -right-[6%] bottom-[2%] w-[34%]"
          />
          <Figura
            nome="fig/raposa-lanterna"
            alt="A raposa com uma lanterna acesa na boca, guiando pela floresta"
            prioridade
            className="absolute left-1/2 -translate-x-[52%] bottom-[9%] w-[58%]"
          />
          <Fogo x="9%" y="22%" tam="8%" atraso={0} />
          <Fogo x="80%" y="16%" tam="7%" atraso={1.2} cor="ouro" />
          <Fogo x="16%" y="62%" tam="6%" atraso={2.1} />
        </motion.div>
      </div>

      {/* borda de baixo: ondas seigaiha em mata, emendando com a próxima seção */}
      <div
        aria-hidden
        className="relative h-6"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12px 24px, transparent 9px, rgb(46 82 64 / 0.22) 9.5px, rgb(46 82 64 / 0.22) 11px, transparent 11.5px)',
          backgroundSize: '24px 24px',
        }}
      />
    </section>
  );
}

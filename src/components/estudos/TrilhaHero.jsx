'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { renderHighlightedTitle } from '@/lib/highlightTitle';
import { resolveImageSrc } from '@/lib/basepath';
import { isExtra } from '@/lib/extraTone';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import ToriiMarco from '@/components/raposa/ToriiMarco';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

/**
 * TrilhaHero — abertura de /trilhas/<trilha>: o nome, o nível, o caminho de
 * torii com o que já foi feito e o botão Começar/Continuar. À direita a
 * raposa da lanterna, que guia (ou a capa da trilha, se houver).
 */
export default function TrilhaHero({ trilha, area, pct, nextStage, onReset, accent, completedTitles = [] }) {
  const extra = isExtra(trilha);
  const slug = trilha.slug || trilha.id;
  const etapas = (trilha.stages || []).filter((s) => !s.hidden);
  const feitas = Math.round((pct / 100) * etapas.length);
  const cta = pct === 0 ? 'Começar a trilha' : pct === 100 ? 'Revisar' : 'Continuar';
  const alvo = nextStage?.slug ? `/trilhas/${slug}/${nextStage.slug}/` : etapas[0]?.slug ? `/trilhas/${slug}/${etapas[0].slug}/` : `/trilhas/${slug}/`;
  const torii = extra ? accent : 'var(--torii)';
  const proxima = etapas.findIndex((s) => !completedTitles.includes(s.title));

  return (
    <header className="relative overflow-hidden pt-[calc(var(--nav-h)+2.5rem)] pb-12 sm:pb-16 bg-[var(--fundo-2)]">
      <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.07} tam={52} />
      <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Breadcrumbs items={[{ name: 'Trilhas', href: '/trilhas/' }, { name: trilha.name?.replace(/\*/g, '') }]} />
          <div className="mt-6 mb-4 flex flex-wrap items-center gap-2 font-sans text-[13px]">
            {extra && <span className="rounded-full px-3 py-1 font-semibold text-[var(--washi)]" style={{ background: accent }}>Extra</span>}
            {area && <span className="rounded-full px-3 py-1 font-semibold border border-linha bg-bg-card text-text">{area.label}</span>}
            {trilha.level && <span className="text-text-dim">{trilha.level}</span>}
            {trilha.duration && <span className="text-text-dim">· {trilha.duration}</span>}
            <span className="text-text-dim">· {etapas.length} {etapas.length === 1 ? 'etapa' : 'etapas'}</span>
          </div>
          <h1 className="font-serif text-[clamp(2.5rem,6vw,4.6rem)] leading-[1] font-extrabold tracking-[-0.02em] text-text-bright" style={FRAUNCES}>
            {renderHighlightedTitle(trilha.name)}
          </h1>
          {trilha.subtitle && <p className="mt-3 font-serif italic text-[1.3rem] text-accent-bright">{trilha.subtitle}</p>}

          {etapas.length > 0 && (
            <div className="mt-7">
              <div className="flex flex-wrap items-center gap-1">
                {etapas.map((s, i) => (
                  <span key={s.id || i} title={s.title}>
                    <ToriiMarco estado={completedTitles.includes(s.title) ? 'feito' : i === proxima ? 'curso' : 'vazio'} tamanho={34} cor={torii} />
                  </span>
                ))}
              </div>
              <p className="mt-2 font-sans text-[14px] text-text-dim">
                {feitas} de {etapas.length} {etapas.length === 1 ? 'torii atravessado' : 'torii atravessados'}
                {pct > 0 && (
                  <button type="button" onClick={onReset} className="ml-3 underline underline-offset-2 hover:text-accent">
                    recomeçar
                  </button>
                )}
              </p>
            </div>
          )}

          <div className="btn-row mt-7">
            <Link href={alvo} className="btn btn--solid btn--lg">
              <Icone nome="torii" size={18} /> {cta}
              {nextStage && pct > 0 && pct < 100 && <span className="font-serif italic font-normal opacity-80">· {nextStage.title}</span>}
            </Link>
            {pct === 100 && <span className="font-sans text-[15px] font-semibold text-accent">Trilha concluída. Que orgulho de você.</span>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative mx-auto w-full max-w-[420px] aspect-square">
          {trilha.coverImage && trilha.thumbMode !== 'icon' ? (
            <div className="absolute inset-[4%] rounded-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImageSrc(trilha.coverImage)} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <>
              <div className="absolute inset-[4%] rounded-full" style={{ background: extra ? accent : 'var(--mata)' }} />
              <div aria-hidden className="absolute left-[44%] top-[46%] w-[40%] aspect-square rounded-full" style={{ background: 'radial-gradient(circle, rgb(233 200 94 / 0.5) 0%, rgb(233 200 94 / 0) 70%)' }} />
              <Figura nome="fig/raposa-lanterna" alt="A raposa com a lanterna, guiando" prioridade className="absolute left-1/2 -translate-x-1/2 bottom-[8%] w-[60%]" />
            </>
          )}
        </motion.div>
      </div>
    </header>
  );
}

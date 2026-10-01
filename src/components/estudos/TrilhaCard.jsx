'use client';

import Link from 'next/link';
import { resolveImageSrc } from '@/lib/basepath';
import { renderHighlightedTitle } from '@/lib/highlightTitle';
import { isExtra, resolveExtraAccent } from '@/lib/extraTone';
import ToriiMarco from '@/components/raposa/ToriiMarco';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

/**
 * TrilhaCard — uma trilha na lista: título, nível, o caminho de torii das
 * etapas (cada uma vermelha quando feita) e o botão Começar/Continuar.
 * À direita a capa, ou a raposa da lanterna num disco da cor da área.
 */
export default function TrilhaCard({ trilha, area, pct = 0, completedTitles = [], accent }) {
  const slug = trilha.slug || trilha.id;
  const base = accent || area?.color || '#2E5240';
  const extra = isExtra(trilha);
  const tom = resolveExtraAccent(trilha, base);
  const etapas = (trilha.stages || []).filter((s) => !s.hidden);
  const emBreve = trilha.comingSoon === true;
  const cta = emBreve ? 'Em breve' : pct === 100 ? 'Revisar' : pct > 0 ? 'Continuar' : 'Começar';
  const proxima = etapas.findIndex((s) => !completedTitles.includes(s.title));
  const torii = extra ? tom : 'var(--torii)';

  return (
    <Link
      href={emBreve ? '#' : `/trilhas/${slug}/`}
      onClick={(e) => emBreve && e.preventDefault()}
      aria-disabled={emBreve || undefined}
      className={`group block rounded-[26px] overflow-hidden bg-bg-card border-[1.5px] border-linha transition-all ${emBreve ? 'opacity-80 cursor-default' : 'hover:border-[var(--torii)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-34px_rgb(19_33_31/0.7)]'}`}
    >
      <div className="grid lg:grid-cols-[1fr_300px]">
        <div className="p-6 md:p-8 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-4 font-sans text-[13px]">
            {emBreve && <span className="rounded-full bg-[var(--ginkgo)] text-[var(--tinta)] px-3 py-1 font-semibold">Em breve</span>}
            {extra && <span className="rounded-full px-3 py-1 font-semibold text-[var(--washi)]" style={{ background: tom }}>Extra</span>}
            {area && <span className="rounded-full px-3 py-1 font-semibold border border-linha text-text">{area.label}</span>}
            {trilha.level && <span className="text-text-dim">{trilha.level}</span>}
            {trilha.duration && <span className="text-text-dim">· {trilha.duration}</span>}
            <span className="ml-auto text-text-dim">{etapas.length} {etapas.length === 1 ? 'etapa' : 'etapas'}</span>
          </div>
          <h2 className="font-serif text-[clamp(1.6rem,2.8vw,2.3rem)] leading-[1.05] font-bold text-text-bright group-hover:text-accent transition-colors" style={FRAUNCES}>
            {renderHighlightedTitle(trilha.name)}
          </h2>
          {trilha.subtitle && <p className="mt-2 font-serif italic text-[1.1rem] text-accent-bright">{trilha.subtitle}</p>}

          {etapas.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-1" aria-label={`${completedTitles.length} de ${etapas.length} etapas concluídas`}>
              {etapas.map((s, i) => (
                <span key={s.id || i} title={s.title}>
                  <ToriiMarco estado={completedTitles.includes(s.title) ? 'feito' : i === proxima && pct > 0 ? 'curso' : 'vazio'} tamanho={28} cor={torii} />
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-6 flex items-center justify-between gap-3">
            <span className={`btn btn--sm ${emBreve ? 'btn--ghost' : 'btn--solid btn--in-card'}`}>
              {cta} {!emBreve && <Icone nome="seta" size={16} />}
            </span>
            {pct > 0 && <span className="font-sans text-[14px] font-semibold text-text-dim">{pct}% do caminho</span>}
          </div>
        </div>

        <div className="relative h-52 lg:h-auto lg:min-h-[280px] overflow-hidden order-first lg:order-last" style={{ background: 'var(--fundo-2)' }}>
          {trilha.thumbMode !== 'icon' && trilha.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImageSrc(trilha.coverImage)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          ) : (
            <>
              <Padronagem nome="seigaiha" cor={extra ? tom : '#2E5240'} opacidade={0.12} tam={40} />
              <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full" style={{ background: extra ? tom : 'var(--mata)' }} />
              <Figura nome="fig/raposa-lanterna" alt="" className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[150px] transition-transform duration-500 group-hover:-translate-y-1" />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

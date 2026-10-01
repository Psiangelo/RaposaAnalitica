'use client';

import Link from 'next/link';
import { defaultIconForKind } from '@/lib/trilhaIcons';
import { renderHighlightedTitle } from '@/lib/highlightTitle';
import { STAGE_KIND_LABEL } from '@/data/trilhas';
import { toRoman } from '@/lib/stageThumb';
import { resolveImageSrc } from '@/lib/basepath';
import { isExtra, resolveExtraAccent, EXTRA_ICON } from '@/lib/extraTone';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

/**
 * StageCard — uma etapa no caminho de torii (/trilhas/<trilha>).
 * Numeral romano, o tipo (leitura, vídeo…), o título, o resumo e o botão
 * de marcar como feita (que pinta o torii ao lado).
 */
export default function StageCard({ stage, idx, trilhaSlug, accent = '#2E5240', done, onToggle, thumb, trilhaCover }) {
  const emBreve = stage.comingSoon === true;
  const href = emBreve ? '#' : `/trilhas/${trilhaSlug}/${stage.slug || stage.title}/`;
  const imagem = stage.thumbMode === 'icon' ? null : resolveImageSrc(thumb || trilhaCover);
  const extra = isExtra(stage);
  const tom = resolveExtraAccent(stage, accent);
  const tipo = extra ? 'Extra' : STAGE_KIND_LABEL[stage.kind] || stage.kind || '';
  const icone = extra ? EXTRA_ICON : stage.icon || defaultIconForKind(stage.kind);
  const blocos = (stage.blocks || []).length;

  return (
    <article className="relative">
      <Link
        href={href}
        onClick={(e) => emBreve && e.preventDefault()}
        aria-disabled={emBreve || undefined}
        className={`group block rounded-[24px] overflow-hidden bg-bg-card border-[1.5px] transition-all ${done ? 'border-[var(--torii)]' : 'border-linha'} ${emBreve ? 'opacity-80 cursor-default' : 'hover:border-[var(--torii)] hover:-translate-y-0.5'}`}
      >
        <div className="grid md:grid-cols-[1fr_200px]">
          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3 font-sans text-[13px]">
              <span className="font-serif italic font-bold text-[1.7rem] leading-none mr-1" style={{ color: extra ? tom : 'var(--torii)' }}>
                {toRoman(idx + 1)}
              </span>
              {emBreve && <span className="rounded-full bg-[var(--ginkgo)] text-[var(--tinta)] px-2.5 py-0.5 font-semibold">Em breve</span>}
              {tipo && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-linha px-2.5 py-0.5 font-semibold text-text">
                  <Icone nome={icone} size={14} /> {tipo}
                </span>
              )}
              {blocos > 0 && <span className="text-text-dim">{blocos} {blocos === 1 ? 'bloco' : 'blocos'}</span>}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle?.();
                }}
                aria-pressed={done}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-colors ${done ? 'bg-[var(--torii)] text-[var(--washi)]' : 'border border-linha text-text hover:border-[var(--torii)]'}`}
              >
                <Icone nome="check" size={14} /> {done ? 'Feita' : 'Marcar como feita'}
              </button>
            </div>
            <h3 className="font-serif text-[1.5rem] md:text-[1.7rem] leading-tight font-bold text-text-bright group-hover:text-accent transition-colors" style={FRAUNCES}>
              {renderHighlightedTitle(stage.title)}
            </h3>
            {stage.summary && <p className="mt-2 font-body text-[1rem] leading-relaxed text-text line-clamp-3 max-w-prose">{stage.summary}</p>}
            {!emBreve && (
              <span className="mt-4 inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-accent">
                Abrir etapa <Icone nome="seta" size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </div>
          <div className="relative order-first md:order-last h-32 md:h-auto md:min-h-[170px] overflow-hidden bg-[var(--fundo-2)]">
            {imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagem} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            ) : (
              <>
                <Padronagem nome="asanoha" cor={extra ? tom : '#2E5240'} opacidade={0.12} tam={36} />
                <span className="absolute inset-0 flex items-center justify-center" style={{ color: extra ? tom : 'var(--cedro)' }}>
                  <Icone nome={icone} size={64} />
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

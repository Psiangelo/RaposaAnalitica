'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { renderHighlightedTitle } from '@/lib/highlightTitle';
import { toRoman } from '@/lib/stageThumb';
import { STAGE_KIND_LABEL } from '@/data/trilhas';
import { isExtra, EXTRA_ICON } from '@/lib/extraTone';
import ToriiMarco from '@/components/raposa/ToriiMarco';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

/**
 * EtapaHero — a abertura de uma etapa: o torii grande com o numeral, o
 * título, o resumo e o botão que atravessa o torii (marca como feita).
 */
export default function EtapaHero({ stage, trilha, area, idx, total, readingTime, done, onToggle, accent = '#2E5240' }) {
  const extra = isExtra(stage);
  const icone = extra ? EXTRA_ICON : stage.icon || 'livro';
  const tipo = extra ? 'Extra' : STAGE_KIND_LABEL[stage.kind] || stage.kind || '';
  const blocos = (stage.blocks || []).length;
  const slug = trilha.slug || trilha.id;
  const cor = extra ? accent : 'var(--torii)';

  return (
    <header className="relative overflow-hidden pt-[calc(var(--nav-h)+2rem)] pb-10 sm:pb-12 text-center bg-[var(--fundo-2)]">
      <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.06} tam={52} />
      <div className="relative max-w-[820px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center items-center gap-2 font-sans text-[13px] mb-6">
          <Link href={`/trilhas/${slug}/`} className="inline-flex items-center gap-1.5 rounded-full border border-linha bg-bg-card px-3 py-1 font-semibold text-text hover:border-[var(--torii)]">
            <Icone nome="setaVolta" size={14} /> {trilha.name?.replace(/\*/g, '')}
          </Link>
          {area && <span className="text-text-dim">{area.label}</span>}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative inline-flex flex-col items-center">
          <ToriiMarco estado={done ? 'feito' : 'curso'} tamanho={92} cor={cor} />
          <span className="font-serif italic font-bold text-[1.4rem] leading-none mt-1" style={{ color: cor }}>
            {toRoman(idx + 1)} <span className="text-text-dim text-[1rem] not-italic font-sans font-semibold">de {total}</span>
          </span>
        </motion.div>

        <h1 className="mt-5 font-serif text-[clamp(2.3rem,5.5vw,4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-text-bright" style={FRAUNCES}>
          {renderHighlightedTitle(stage.title)}
        </h1>
        {stage.summary && <p className="mt-4 mx-auto max-w-[52ch] font-serif italic text-[1.2rem] leading-snug text-text">{stage.summary}</p>}

        <p className="mt-5 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 font-sans text-[14px] text-text-dim">
          {tipo && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-text">
              <Icone nome={icone} size={15} /> {tipo}
            </span>
          )}
          {blocos > 0 && <span>· {blocos} {blocos === 1 ? 'bloco' : 'blocos'}</span>}
          {readingTime > 0 && <span>· {readingTime} min</span>}
        </p>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          className={`mt-7 btn ${done ? 'btn--wine' : 'btn--solid'}`}
        >
          <Icone nome={done ? 'check' : 'torii'} size={18} /> {done ? 'Torii atravessado' : 'Marcar como feita'}
        </button>
      </div>
    </header>
  );
}

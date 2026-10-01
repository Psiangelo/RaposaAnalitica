'use client';

import PageHero from '@/components/ui/PageHero';

/**
 * EstudosHero — abertura de /trilhas: o caminho dos mil torii.
 * Props: eyebrow, title, emphasis, lead, meta ([{label, value}])
 */
export default function EstudosHero({ eyebrow, title, emphasis, lead, meta = [] }) {
  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      emphasis={emphasis}
      lead={lead}
      figura="obj/tunel-de-torii"
      figuraAlt="O túnel de mil torii vermelhos do santuário de Inari"
      disco="var(--fundo-2)"
    >
      {meta.length > 0 && (
        <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
          {meta.map((m) => (
            <div key={m.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{m.label}</dt>
              <dd className="font-serif text-[2rem] font-bold text-text-bright leading-none">{m.value}</dd>
              <span className="font-sans text-[14px] text-text-dim">{m.label}</span>
            </div>
          ))}
        </dl>
      )}
    </PageHero>
  );
}

'use client';

import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Figura from '@/components/raposa/Figura';
import Rotulo from '@/components/raposa/Rotulo';
import Padronagem from '@/components/raposa/Padronagem';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

const FUNDOS = {
  papel: { classe: '', padrao: 'asanoha', cor: '#2E5240', opac: 0.05 },
  nevoa: { classe: 'bg-[var(--nevoa)]', padrao: 'seigaiha', cor: '#2E5240', opac: 0.08 },
  velho: { classe: 'bg-[var(--papel-velho)]', padrao: 'kikko', cor: '#6B4A35', opac: 0.09 },
  noite: { classe: 'noite', padrao: 'sazanami', cor: '#9DB9C4', opac: 0.08 },
};

/**
 * Abertura das páginas internas: rótulo, título com o pivô em itálico
 * vermelho, texto e, à direita, uma figura da floresta num disco.
 */
export default function PageHero({
  eyebrow,
  title,
  emphasis,
  kicker,
  lead,
  actions,
  breadcrumbs,
  sideCard,
  figura,
  figuraAlt = '',
  disco = 'var(--fundo-2)',
  fundo = 'papel',
  recorte = false,
  children,
}) {
  const f = FUNDOS[fundo] || FUNDOS.papel;
  return (
    <section className={`relative overflow-hidden pt-[calc(var(--nav-h)+2.5rem)] sm:pt-[calc(var(--nav-h)+3.5rem)] pb-12 sm:pb-16 ${f.classe}`}>
      <Padronagem nome={f.padrao} cor={f.cor} opacidade={f.opac} tam={52} />
      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {breadcrumbs && <div className="mb-5"><Breadcrumbs items={breadcrumbs} /></div>}
          {eyebrow && <Rotulo className="mb-5">{eyebrow}</Rotulo>}
          <h1 className="font-serif text-[clamp(2.6rem,6.4vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.02em] text-text-bright" style={FRAUNCES}>
            {title}
            {emphasis && (
              <>
                {' '}
                <em className="italic font-bold text-accent-bright">{emphasis}</em>
              </>
            )}
          </h1>
          {kicker && <p className="mt-3 font-serif italic text-[1.35rem] text-accent" style={FRAUNCES}>{kicker}</p>}
          {lead && <p className="mt-5 font-body text-[1.12rem] leading-relaxed text-text max-w-[54ch]">{lead}</p>}
          {actions && <div className="btn-row mt-7">{actions}</div>}
          {children}
        </motion.div>
        {(figura || sideCard) && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
            {sideCard || (
              <div className="relative mx-auto w-full max-w-[400px] aspect-square">
                {recorte ? (
                  <div className="absolute inset-[6%] rounded-full overflow-hidden" style={{ background: disco }}>
                    <Figura nome={figura} alt={figuraAlt} prioridade className="absolute left-1/2 -translate-x-1/2 -bottom-[2%] w-[112%] max-w-none" />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-[6%] rounded-full" style={{ background: disco }} />
                    <Figura nome={figura} alt={figuraAlt} prioridade className="absolute left-1/2 -translate-x-1/2 bottom-[4%] w-[78%]" />
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

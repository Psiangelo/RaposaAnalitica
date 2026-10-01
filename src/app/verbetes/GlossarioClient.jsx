'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import VisibilityGate from '@/components/VisibilityGate';
import { MascaraVerbete } from '@/components/home/Secoes';
import Icone from '@/components/raposa/Icone';
import { FRAUNCES } from '@/components/raposa/Cabecalho';
import { useSitedata } from '@/lib/useSitedata';
import {
  getGlossario, getGlossarioCategories, getGlossarioPage, mascaraInfo,
  DEFAULT_GLOSSARIO_PAGE, SITEDATA_KEYS,
} from '@/lib/sitedata';

/**
 * /verbetes — as máscaras da floresta. Cada família de conceitos tem a sua
 * máscara (a cor diz o sentido); dentro dela, os verbetes em cartões.
 * Busca por termo e apelido; filtro por família.
 */
export default function GlossarioClient({ initialList, initialCategories }) {
  const list = useSitedata(getGlossario, initialList, SITEDATA_KEYS.glossario);
  const categories = useSitedata(getGlossarioCategories, initialCategories, SITEDATA_KEYS.glossarioCategories);
  const pageData = useSitedata(getGlossarioPage, DEFAULT_GLOSSARIO_PAGE, SITEDATA_KEYS.glossarioPage);
  const [query, setQuery] = useState('');
  const [familia, setFamilia] = useState('');
  const q = query.trim().toLowerCase();

  const grouped = useMemo(() => {
    const visible = list.filter((t) => !t.hidden);
    const filtered = visible.filter((t) => {
      const casa = !q || [t.term, ...(t.aliases || []), t.short].join(' ').toLowerCase().includes(q);
      return casa && (!familia || t.category === familia);
    });
    const map = new Map(categories.map((c) => [c.slug, { cat: c, items: [] }]));
    const orphans = [];
    for (const t of filtered) {
      if (map.has(t.category)) map.get(t.category).items.push(t);
      else orphans.push(t);
    }
    return { groups: Array.from(map.values()), orphans };
  }, [list, categories, q, familia]);

  const total = list.filter((t) => !t.hidden).length;
  const achados = grouped.groups.reduce((n, g) => n + g.items.length, 0) + grouped.orphans.length;

  const Cartao = ({ term, cat }) => (
    <Link
      href={`/verbetes/${term.slug}/`}
      className="group flex gap-4 items-start rounded-[22px] bg-bg-card border-[1.5px] border-linha p-4 sm:p-5 hover:border-[var(--torii)] hover:-translate-y-0.5 transition-all"
    >
      <MascaraVerbete categoria={cat} mascara={term.mascara} tamanho="sm" className="mt-0.5 group-hover:rotate-[-5deg] transition-transform" />
      <span className="min-w-0">
        <span className="block font-serif text-[1.3rem] font-bold leading-tight text-text-bright group-hover:text-accent transition-colors" style={FRAUNCES}>
          {term.term}
        </span>
        {term.aliases?.length > 0 && (
          <span className="block font-sans text-[12.5px] text-text-dim mt-0.5">também: {term.aliases.slice(0, 2).join(', ')}</span>
        )}
        <span className="block mt-1.5 font-body text-[0.95rem] leading-snug text-text line-clamp-3">{term.short}</span>
      </span>
    </Link>
  );

  return (
    <VisibilityGate visibilityKey="glossario" title="Verbetes indisponíveis">
      <Navbar />
      <main id="conteudo">
        <PageHero
          eyebrow={pageData.hero.eyebrow}
          title={pageData.hero.title}
          emphasis={pageData.hero.emphasis}
          kicker={pageData.hero.kicker}
          lead={pageData.hero.lead?.replace?.('{count}', total) || pageData.hero.lead}
          figura="mascara/kin"
          figuraAlt="Uma máscara de kitsune dourada com fitinhas"
          disco="var(--mata)"
          fundo="nevoa"
        >
          <p className="mt-6 font-sans text-[14px] text-text-dim">{total} verbetes</p>
        </PageHero>

        <section className="py-10 sm:py-14">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 mb-12">
              <label className="relative max-w-[460px]">
                <span className="sr-only">Buscar verbete</span>
                <Icone nome="busca" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar (ex.: si-mesmo, máscara, sombra)"
                  className="w-full h-12 pl-11 pr-4 rounded-full bg-bg-card border-[1.5px] border-linha font-sans text-[15px] text-text-bright placeholder:text-text-faint focus:outline-none focus:border-[var(--acento)]"
                />
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por família">
                <button
                  onClick={() => setFamilia('')}
                  className={`h-10 px-4 rounded-full font-sans text-[14px] font-semibold transition-colors ${!familia ? 'bg-mata text-[var(--washi)]' : 'bg-bg-card border border-linha text-text hover:border-[var(--acento)]'}`}
                >
                  Todas
                </button>
                {categories.map((c) => {
                  const m = mascaraInfo(c.mascara);
                  const ativo = familia === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setFamilia(ativo ? '' : c.slug)}
                      className={`inline-flex items-center gap-2 h-10 pl-1.5 pr-4 rounded-full font-sans text-[14px] font-semibold border transition-colors ${ativo ? 'bg-mata text-[var(--washi)] border-transparent' : 'bg-bg-card border-linha text-text hover:border-[var(--acento)]'}`}
                    >
                      <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: m.fundo }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.cor, boxShadow: '0 0 0 1.5px rgb(19 33 31 / 0.25)' }} />
                      </span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {(q || familia) && (
                <p className="font-sans text-[14px] text-text-dim">
                  {achados} {achados === 1 ? 'verbete' : 'verbetes'}
                </p>
              )}
            </div>

            {grouped.groups.map(({ cat, items }) => {
              if (!items.length) return null;
              const m = mascaraInfo(cat.mascara);
              return (
                <section key={cat.slug} className="mb-16 scroll-mt-28" id={cat.slug}>
                  <header className="flex items-center gap-4 mb-6">
                    <MascaraVerbete categoria={cat} />
                    <div>
                      <h2 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-text-bright leading-tight" style={FRAUNCES}>
                        {cat.label}
                      </h2>
                      <p className="font-sans text-[13.5px] text-text-dim">
                        máscara {m.nome.toLowerCase()} · {m.sentido} · {items.length} {items.length === 1 ? 'verbete' : 'verbetes'}
                      </p>
                    </div>
                  </header>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((t) => (
                      <Cartao key={t.slug} term={t} cat={cat} />
                    ))}
                  </div>
                </section>
              );
            })}

            {grouped.orphans.length > 0 && (
              <section className="mb-16">
                <h2 className="font-serif text-[1.8rem] font-bold text-text-bright mb-6" style={FRAUNCES}>Outros</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped.orphans.map((t) => (
                    <Cartao key={t.slug} term={t} cat={{ mascara: 'shiro' }} />
                  ))}
                </div>
              </section>
            )}

            {achados === 0 && (
              <p className="text-center font-serif italic text-[1.3rem] text-text-dim py-16">
                {q ? `Nenhum verbete com “${query.trim()}”.` : pageData.empty?.emptyMessage || 'Nenhum verbete ainda.'}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </VisibilityGate>
  );
}

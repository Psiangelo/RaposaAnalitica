'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { marked } from 'marked';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisibilityGate from '@/components/VisibilityGate';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Padronagem from '@/components/raposa/Padronagem';
import Figura from '@/components/raposa/Figura';
import Rotulo from '@/components/raposa/Rotulo';
import Icone from '@/components/raposa/Icone';
import { FRAUNCES } from '@/components/raposa/Cabecalho';
import { MascaraVerbete } from '@/components/home/Secoes';
import { useSitedata } from '@/lib/useSitedata';
import { getGlossario, getGlossarioCategories, getMaterials, mascaraInfo, SITEDATA_KEYS } from '@/lib/sitedata';
import { resolveLink } from '@/lib/linkResolver';
import { renderHighlightedTitle } from '@/lib/highlightTitle';
import { resolveImageSrc } from '@/lib/basepath';

/**
 * /verbetes/<slug> — o verbete: a máscara grande da família, o essencial,
 * o texto completo, os vizinhos e os ensaios que usam o termo.
 */
export default function TermoClient({ initialTermo, initialList, initialCategories, initialPosts = [], initialCourses = [], relatedEssays = [] }) {
  const list = useSitedata(getGlossario, initialList, SITEDATA_KEYS.glossario);
  const categories = useSitedata(getGlossarioCategories, initialCategories, SITEDATA_KEYS.glossarioCategories);
  const materials = useSitedata(getMaterials, [], SITEDATA_KEYS.materials);

  const term = useMemo(() => list.find((t) => t.slug === initialTermo.slug) || initialTermo, [list, initialTermo]);
  const cat = categories.find((c) => c.slug === term.category) || { mascara: 'shiro', label: 'Verbete' };
  const m = mascaraInfo(term.mascara || cat.mascara);
  const relacionados = (term.related?.terms || []).map((s) => list.find((g) => g.slug === s)).filter(Boolean);
  const daFamilia = list.filter((g) => g.category === term.category && g.slug !== term.slug && !g.hidden).slice(0, 6);
  const vizinhos = relacionados.length ? relacionados : daFamilia;
  const fullHtml = marked.parse(String(term.full || ''));
  const links = (term.links || []).map((l) => resolveLink(l, { materials, posts: initialPosts, courses: initialCourses, glossario: list })).filter((l) => !l.missing);
  const catDe = (slug) => categories.find((c) => c.slug === slug) || { mascara: 'shiro' };

  return (
    <VisibilityGate visibilityKey="glossario" title="Verbetes indisponíveis">
      <Navbar />
      <main id="conteudo">
        <header className="relative overflow-hidden pt-[calc(var(--nav-h)+2.5rem)] pb-12 sm:pb-16" style={{ background: m.fundo }}>
          <Padronagem nome="asanoha" cor="#13211F" opacidade={0.05} tam={56} />
          <div className="relative max-w-[1060px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <Breadcrumbs items={[{ name: 'Verbetes', href: '/verbetes/' }, { name: cat.label, href: `/verbetes/#${cat.slug}` }, { name: term.term }]} />
              <Rotulo className="mt-6 mb-3">Verbete · {cat.label}</Rotulo>
              <h1 className="font-serif text-[clamp(2.8rem,7vw,5.2rem)] leading-[0.96] font-extrabold tracking-[-0.02em] text-[var(--tinta)]" style={FRAUNCES}>
                {term.term}
              </h1>
              {term.aliases?.length > 0 && (
                <p className="mt-2 font-sans text-[14px] text-[rgb(19_33_31/0.7)]">também chamado: {term.aliases.join(', ')}</p>
              )}
              {term.short && (
                <p className="mt-5 font-serif italic text-[clamp(1.25rem,2.4vw,1.55rem)] leading-snug text-[var(--tinta)] max-w-[34ch]" style={FRAUNCES}>
                  {term.short}
                </p>
              )}
            </div>
            <div className="relative mx-auto md:mx-0">
              <div className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full flex items-center justify-center bg-[rgb(242_235_220/0.55)] shadow-[inset_0_0_0_6px_rgb(242_235_220/0.6)]">
                <Figura nome={`mascara/${m.id}`} alt={`Máscara ${m.nome.toLowerCase()}: ${m.sentido}`} prioridade className="w-[56%] rotate-[-6deg]" />
              </div>
              <p className="mt-3 text-center font-sans text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[rgb(19_33_31/0.7)]">máscara {m.da || `de ${m.sentido}`}</p>
            </div>
          </div>
        </header>

        <article className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {fullHtml.trim() ? (
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: fullHtml }} />
          ) : (
            <p className="font-serif italic text-text-dim">O texto completo deste verbete ainda está sendo escrito.</p>
          )}

          {links.some((r) => r.embed && r.embed.provider !== 'raw') && (
            <div className="mt-10 space-y-6">
              {links
                .filter((r) => r.embed && r.embed.provider !== 'raw')
                .map((r, i) => (
                  <div key={i}>
                    <p className="meta-caps-accent mb-2">{r.kindLabel}</p>
                    <div className="aspect-video rounded-2xl overflow-hidden bg-bg-card">
                      <iframe src={r.embed.src} title={r.label} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="w-full h-full" />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {links.some((r) => !r.embed && r.href) && (
            <aside className="mt-12 pt-8 border-t border-linha">
              <p className="meta-caps-accent mb-4">Para continuar</p>
              <ul className="space-y-2">
                {links
                  .filter((r) => !r.embed && r.href)
                  .map((r, i) => {
                    const inner = (
                      <span className="inline-flex items-center gap-2 font-serif text-[1.1rem] text-text-bright hover:text-accent">
                        <Icone nome="seta" size={16} className="text-torii" /> {r.label}
                        <span className="font-sans text-[12px] uppercase tracking-[0.12em] text-text-dim">{r.kindLabel}</span>
                      </span>
                    );
                    return <li key={i}>{r.isExternal ? <a href={r.href} target="_blank" rel="noopener noreferrer">{inner}</a> : <Link href={r.href}>{inner}</Link>}</li>;
                  })}
              </ul>
            </aside>
          )}

          {relatedEssays.length > 0 && (
            <aside className="mt-14 pt-8 border-t border-linha">
              <p className="meta-caps-accent mb-6">Ensaios que usam este termo</p>
              <ul className="grid gap-6 sm:grid-cols-2">
                {relatedEssays.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/blog/${e.slug}/`} className="group grid grid-cols-[96px_1fr] gap-4 items-start">
                      <span className="relative block aspect-[4/5] rounded-xl overflow-hidden bg-[var(--fundo-2)]">
                        {e.cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveImageSrc(e.cover)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        )}
                      </span>
                      <span>
                        <span className="block font-serif text-[1.15rem] font-bold leading-snug text-text-bright group-hover:text-accent" style={FRAUNCES}>
                          {renderHighlightedTitle(e.title)}
                        </span>
                        {e.excerpt && <span className="block mt-1 font-body text-[0.92rem] text-text line-clamp-3">{e.excerpt}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </article>

        {vizinhos.length > 0 && (
          <section className="bg-[var(--fundo-2)] py-14">
            <div className="max-w-[1060px] mx-auto px-4 sm:px-6 lg:px-8">
              <p className="meta-caps-accent mb-6">{relacionados.length ? 'Verbetes vizinhos' : `Mais da família ${cat.label.toLowerCase()}`}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vizinhos.map((t) => (
                  <Link key={t.slug} href={`/verbetes/${t.slug}/`} className="group flex gap-3.5 items-center rounded-[20px] bg-bg-card border-[1.5px] border-linha p-4 hover:border-[var(--torii)] transition-colors">
                    <MascaraVerbete categoria={catDe(t.category)} mascara={t.mascara} tamanho="sm" />
                    <span className="min-w-0">
                      <span className="block font-serif text-[1.15rem] font-bold text-text-bright group-hover:text-accent" style={FRAUNCES}>{t.term}</span>
                      <span className="block font-body text-[0.88rem] text-text line-clamp-2">{t.short}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/verbetes/" className="link-arrow mt-8">Todos os verbetes <Icone nome="seta" size={16} /></Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </VisibilityGate>
  );
}

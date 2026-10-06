'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import HiddenPlaceholder from '@/components/HiddenPlaceholder';
import AuthorBand from '@/components/AuthorBand';
import Newsletter from '@/components/ui/Newsletter';
import Toca from '@/components/raposa/Toca';
import EnsaioCard from '@/components/blog/EnsaioCard';
import TagSelo from '@/components/blog/TagSelo';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import { useVisibility } from '@/lib/useVisibility';
import { getBlogPosts, getBlogSeries, SITEDATA_KEYS } from '@/lib/sitedata';
import { ordenarPublicados } from '@/lib/ensaios';
import { stripHighlights } from '@/lib/highlightTitle';
import { BASE_PATH } from '@/lib/site';

/**
 * /blog — a clareira. O ensaio fixado (ou o mais novo) em destaque, a busca,
 * as tags como fileira de selos e a grade. Fecha com «quem escreve» e as
 * Cartas. Cada card leva à página própria do ensaio (/blog/<slug>/).
 */
export default function BlogPage({ initialPosts = [], initialSeriesList = [] }) {
  const { visibility, ready } = useVisibility();
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [series, setSeries] = useState(initialSeriesList);
  const [busca, setBusca] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    const load = () => {
      setAllPosts(getBlogPosts());
      setSeries(getBlogSeries());
    };
    load();
    const onChanged = (e) => {
      const k = e.detail?.key;
      if (!k || k === SITEDATA_KEYS.blog || k === SITEDATA_KEYS.blogSeries) load();
    };
    window.addEventListener('storage', load);
    window.addEventListener('sitedata:changed', onChanged);
    window.addEventListener('sitedata:bootstrap', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('sitedata:changed', onChanged);
      window.removeEventListener('sitedata:bootstrap', load);
    };
  }, []);

  // Links antigos no formato /blog/?post=slug viram a URL própria do ensaio.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('post');
    if (!p || allPosts.length === 0) return;
    const f = allPosts.find((x) => x.slug === p || x.id === p);
    if (f) window.location.replace(`${BASE_PATH}/blog/${f.slug || f.id}/`);
  }, [allPosts]);

  const publicados = useMemo(() => ordenarPublicados(allPosts), [allPosts]);
  const tags = useMemo(() => {
    const t = new Map();
    publicados.forEach((p) => (p.tags || []).forEach((x) => t.set(x, (t.get(x) || 0) + 1)));
    return Array.from(t.entries()).sort((a, b) => b[1] - a[1]).map(([x]) => x);
  }, [publicados]);

  const filtrando = !!(busca || tag);
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return publicados.filter((p) => {
      const casaBusca = !q || stripHighlights(p.title || '').toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q));
      const casaTag = !tag || (p.tags || []).includes(tag);
      return casaBusca && casaTag;
    });
  }, [publicados, busca, tag]);

  const destaque = !filtrando ? publicados[0] : null;
  const resto = destaque ? filtrados.filter((p) => p !== destaque) : filtrados;
  const seriesAtivas = (series || []).filter((s) => publicados.some((p) => p.seriesId === s.id));

  if (ready && visibility.blog === false) return <HiddenPlaceholder title="Ensaios indisponíveis" />;

  return (
    <>
      <Navbar />
      <main id="conteudo" className="min-h-screen">
        <PageHero
          eyebrow="Ensaios"
          title="Da"
          emphasis="clareira"
          lead="Textos longos para ler com calma: uma pergunta de cada vez, com a referência de cada coisa para você ir à fonte. Os termos com um ? abrem o verbete sem sair da leitura."
          figura="fig/raposa-capim"
          figuraAlt="A raposa espiando no capim alto"
          disco="var(--nevoa)"
        >
          <p className="mt-6 font-sans text-[14px] text-text-dim">
            {publicados.length} {publicados.length === 1 ? 'ensaio publicado' : 'ensaios publicados'}
          </p>
        </PageHero>

        {destaque && (
          <section className="pb-6">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
              <EnsaioCard post={destaque} variante="destaque" />
            </div>
          </section>
        )}

        <section className="relative pt-10 pb-20">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            {publicados.length > 0 && (
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-10 pb-8 border-b border-linha">
                <label className="relative flex-1 max-w-[440px]">
                  <span className="sr-only">Buscar nos ensaios</span>
                  <Icone nome="busca" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar nos ensaios…"
                    className="w-full h-12 pl-11 pr-4 rounded-full bg-bg-card border-[1.5px] border-linha font-sans text-[15px] text-text-bright placeholder:text-text-faint focus:outline-none focus:border-[var(--acento)]"
                  />
                </label>
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setTag('')}
                      className={`h-8 px-3.5 rounded-full font-sans text-[13px] font-semibold transition-colors ${!tag ? 'bg-mata text-[var(--washi)]' : 'bg-bg-card border border-linha text-text hover:border-[var(--acento)]'}`}
                    >
                      Todos
                    </button>
                    {tags.map((t) => (
                      <button key={t} onClick={() => setTag(t === tag ? '' : t)} className={`rounded-full transition-[transform,opacity] ${tag && tag !== t ? 'opacity-55 hover:opacity-90' : ''} ${tag === t ? 'ring-2 ring-offset-2 ring-offset-[var(--fundo)] ring-[var(--torii)]' : ''}`}>
                        <TagSelo tag={t} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {resto.length > 0 ? (
              <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {resto.map((p) => (
                  <EnsaioCard key={p.id || p.slug} post={p} />
                ))}
              </div>
            ) : filtrando ? (
              <div className="flex flex-col items-center text-center py-16">
                <Figura nome="fig/raposa-tigela" alt="" className="w-[180px] mb-5" />
                <p className="font-serif text-[1.5rem] text-text-bright">Nada com esse filtro.</p>
                <button onClick={() => { setBusca(''); setTag(''); }} className="mt-4 btn btn--ghost btn--sm">Limpar a busca</button>
              </div>
            ) : publicados.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16">
                <Figura nome="fig/raposa-dormindo-lua" alt="" className="w-[220px] mb-5" />
                <p className="font-serif text-[1.5rem] text-text-bright">Estou escrevendo o primeiro.</p>
              </div>
            ) : null}

            {!filtrando && seriesAtivas.length > 0 && (
              <div className="mt-20">
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">Séries</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {seriesAtivas.map((s) => {
                    const daSerie = publicados.filter((p) => p.seriesId === s.id).sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
                    return (
                      <a key={s.id} href={`${BASE_PATH}/blog/${daSerie[0]?.slug || ''}/`} className="block rounded-[22px] bg-bg-card border border-linha p-5 hover:border-[var(--torii)] transition-colors">
                        <p className="font-serif text-[1.3rem] font-bold text-text-bright">{s.name || s.title}</p>
                        <p className="mt-1 font-sans text-[13px] text-text-dim">{daSerie.length} ensaios</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {visibility.autor !== false && <AuthorBand />}
        <Toca />
        {visibility.newsletter !== false && <Newsletter source="blog" />}
      </main>
      <Footer />
    </>
  );
}

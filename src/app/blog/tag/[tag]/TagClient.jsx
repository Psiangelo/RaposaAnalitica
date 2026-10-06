'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import EnsaioCard from '@/components/blog/EnsaioCard';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import { useSitedata } from '@/lib/useSitedata';
import { getTagEstilos, SITEDATA_KEYS } from '@/lib/sitedata';
import { estiloDaTag } from '@/lib/wagara';

/** /blog/tag/<tag> — os ensaios de uma tag, no papel com a padronagem dela. */
export default function TagClient({ tag, posts }) {
  const mapa = useSitedata(getTagEstilos, {}, SITEDATA_KEYS.tagEstilos);
  const e = estiloDaTag(tag, mapa);
  return (
    <>
      <Navbar />
      <main id="conteudo" className="min-h-screen">
        <div className="relative">
          <PageHero
            breadcrumbs={[{ name: 'Ensaios', href: '/blog/' }, { name: tag }]}
            eyebrow={`${posts.length} ${posts.length === 1 ? 'ensaio' : 'ensaios'}`}
            title={tag}
            lead={`Os ensaios marcados com “${tag}”.`}
          />
          <div aria-hidden className="absolute inset-0 -z-0 pointer-events-none">
            <Padronagem nome={e.padrao} cor={e.cor} opacidade={0.06} tam={52} />
          </div>
        </div>
        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif italic text-[1.3rem] text-text-dim">Nenhum ensaio com esta tag ainda.</p>
              <Link href="/blog/" className="link-arrow mt-5">
                <Icone nome="setaVolta" size={16} /> Todos os ensaios
              </Link>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <EnsaioCard key={p.id || p.slug} post={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

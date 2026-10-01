'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionLabel from '@/components/SectionLabel';

/**
 * LegalPage — casca compartilhada das páginas de política (privacidade,
 * cookies). Mesma tipografia do resto do site, sem ornamento: é texto que
 * precisa ser lido e encontrado, não impressionar.
 *
 * O conteúdo entra como children, em prosa. Deliberadamente NÃO é editável
 * pelo admin: texto legal alterado por engano é pior que texto desatualizado,
 * e mudança aqui deve passar por revisão consciente (e ficar no git).
 */
export default function LegalPage({ eyebrow, title, updatedAt, children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-5 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[720px] mx-auto">
          <SectionLabel label={eyebrow} />
          <h1 className="font-serif text-[clamp(2rem,4.5vw,3rem)] text-text-bright leading-[1.1] mb-4">
            {title}
          </h1>
          {updatedAt && (
            <p className="font-sans text-[12.5px] font-semibold uppercase tracking-[0.2em] text-text-dim mb-12">
              Atualizada em {updatedAt}
            </p>
          )}

          <div className="legal-prose">{children}</div>
        </div>
      </main>
      <Footer showMaterialsCta={false} />
    </>
  );
}

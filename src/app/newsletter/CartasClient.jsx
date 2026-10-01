'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import VisibilityGate from '@/components/VisibilityGate';
import { FormularioCartas } from '@/components/ui/Newsletter';
import Icone from '@/components/raposa/Icone';
import Rotulo from '@/components/raposa/Rotulo';
import Padronagem from '@/components/raposa/Padronagem';
import { TituloSecao, FRAUNCES } from '@/components/raposa/Cabecalho';
import { useSitedata } from '@/lib/useSitedata';
import { getNewsletterConfig, DEFAULT_NEWSLETTER, getBlogPosts, SITEDATA_KEYS } from '@/lib/sitedata';
import { ordenarPublicados } from '@/lib/ensaios';
import { stripHighlights } from '@/lib/highlightTitle';

const ICONES = ['carta', 'lanterna', 'selo'];

/**
 * /newsletter — as Cartas da Raposa: o que chega, um exemplo de carta e o
 * formulário (que manda o e-mail para o serviço escolhido no painel).
 */
export default function CartasClient() {
  const c = useSitedata(getNewsletterConfig, DEFAULT_NEWSLETTER, SITEDATA_KEYS.newsletter);
  const posts = ordenarPublicados(useSitedata(getBlogPosts, [], SITEDATA_KEYS.blog));
  const ultimo = posts[0];
  const p = c.pagina || {};

  return (
    <VisibilityGate visibilityKey="newsletter" title="Cartas indisponíveis">
      <Navbar />
      <main id="conteudo">
        <PageHero
          eyebrow={p.eyebrow}
          title={p.title}
          emphasis={p.emphasis}
          lead={p.lead}
          figura="fig/raposa-wagasa"
          figuraAlt="A raposa sob o guarda-chuva, na chuva com sol"
          disco="var(--nevoa)"
          fundo="velho"
        >
          <div className="mt-8 max-w-[560px]">
            <FormularioCartas source="pagina-cartas" />
          </div>
        </PageHero>

        {p.itens?.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
              <Rotulo className="mb-4">O combinado</Rotulo>
              <TituloSecao antes="O que vem" pivo="em cada carta" />
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {p.itens.map((it, i) => (
                  <div key={i} className="rounded-[24px] bg-bg-card border border-linha p-6">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--fundo-2)] text-[var(--urushi)]">
                      <Icone nome={ICONES[i % ICONES.length]} size={22} />
                    </span>
                    <p className="mt-4 font-serif text-[1.35rem] font-bold text-text-bright" style={FRAUNCES}>{it.titulo}</p>
                    <p className="mt-1.5 font-body text-[1rem] leading-relaxed text-text">{it.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* uma carta de exemplo, montada com o que o site tem de verdade */}
        <section className="relative overflow-hidden py-16 sm:py-20 bg-[var(--fundo-2)]">
          <Padronagem nome="sazanami" cor="#2E5240" opacidade={0.07} tam={48} />
          <div className="relative max-w-[760px] mx-auto px-4 sm:px-6">
            <p className="text-center font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-accent mb-5">Mais ou menos assim</p>
            <div className="relative rounded-[22px] bg-[#FBF8F1] shadow-[0_30px_60px_-34px_rgb(19_33_31/0.7)] overflow-hidden">
              <div className="h-3" style={{ background: 'repeating-linear-gradient(135deg, var(--torii) 0 14px, #FBF8F1 14px 22px, var(--ai) 22px 36px, #FBF8F1 36px 44px)' }} />
              <div className="p-6 sm:p-9 font-body text-[1.02rem] leading-relaxed text-[var(--tinta)]">
                <p className="font-sans text-[13px] text-[#56655D]">De: Raposa Analítica · Assunto: {c.nome}</p>
                <p className="mt-5">Oi,</p>
                {ultimo && (
                  <p className="mt-3">
                    saiu ensaio novo na clareira: <b>{stripHighlights(ultimo.title)}</b>{/[.!?]$/.test(stripHighlights(ultimo.title)) ? '' : '.'} {ultimo.excerpt}
                  </p>
                )}
                <p className="mt-3">
                  E o achado da vez: no mesmo parágrafo em que Jung chama a floresta de metáfora do inconsciente (OC 13 §241), a nota 5 descreve uma gravura em que uma raposa some num buraco da montanha. O “animal prestativo”, diz ele, indica o caminho que leva ao templo.
                </p>
                <p className="mt-3">Até a próxima trilha,</p>
                <p className="font-serif italic text-[1.2rem] text-[var(--urushi)]" style={FRAUNCES}>Raposa Analítica</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </VisibilityGate>
  );
}

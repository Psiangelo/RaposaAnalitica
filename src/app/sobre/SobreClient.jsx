'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import { ConverseComigo } from '@/components/home/Secoes';
import Figura from '@/components/raposa/Figura';
import Rotulo from '@/components/raposa/Rotulo';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import { SeloLocus } from '@/components/raposa/Selo';
import { TituloSecao, FRAUNCES } from '@/components/raposa/Cabecalho';
import { useSitedata } from '@/lib/useSitedata';
import { getHomepage, DEFAULT_HOMEPAGE, getBio, DEFAULT_BIO, getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';

const W = 'max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8';

// a figura de cada gosto (se o gosto não estiver aqui, entra a pegada)
const FIGURA_DO_GOSTO = {
  mitologia: { fig: 'obj/livro', disco: 'var(--nevoa)' },
  xadrez: { fig: 'fig/coruja', disco: 'var(--fundo-2)' },
  anime: { fig: 'mata/lua', disco: 'var(--noite)' },
  escrever: { fig: 'obj/pincel', disco: 'var(--papel-velho)' },
  doce: { fig: 'obj/dango', disco: 'var(--mata)' },
};

/**
 * /sobre — quem escreve: a raposa estudante, o mito de origem (a raposa que
 * guia ao templo, OC 13 §241 n. 5), os gostos e o «converse comigo».
 */
export default function SobreClient() {
  const home = useSitedata(getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS.homepage);
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const a = { ...DEFAULT_HOMEPAGE.about, ...(home?.about || {}) };
  const autor = bio?.author || DEFAULT_BIO.author;

  return (
    <>
      <Navbar />
      <main id="conteudo">
        <PageHero
          eyebrow={a.title || 'Quem sou eu'}
          title="Sou estudante"
          emphasis="de psicologia"
          lead={a.paragraph1}
          figura="fig/raposa-anotando"
          figuraAlt={autor.photo?.alt || 'A raposa de óculos anotando no caderninho'}
          disco="var(--kaki)"
          fundo="velho"
        >
          <p className="mt-6 font-sans text-[15px] text-text-dim">
            <b className="text-text-bright">{autor.name}</b> · {autor.credential}
          </p>
        </PageHero>

        <section className="py-16 sm:py-20">
          <div className={`${W} grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start`}>
            <div className="max-w-[640px]">
              {a.paragraph2 && <p className="font-body text-[1.15rem] leading-[1.8] text-text">{a.paragraph2}</p>}
              {a.paragraph3 && <p className="mt-5 font-body text-[1.15rem] leading-[1.8] text-text">{a.paragraph3}</p>}
              {Array.isArray(a.credentials) && a.credentials.length > 0 && (
                <ul className="mt-10 divide-y divide-linha border-y border-linha">
                  {a.credentials.map((c) => (
                    <li key={c.label} className="grid grid-cols-[110px_1fr] gap-4 py-3.5">
                      <span className="font-sans text-[12.5px] font-semibold uppercase tracking-[0.12em] text-accent pt-0.5">{c.label}</span>
                      <span className="font-body text-[1rem] text-text">{c.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
              {autor.disclaimer && (
                <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--fundo-2)] px-4 py-2 font-sans text-[14px] text-text">
                  <Icone nome="selo" size={16} className="text-[var(--urushi)]" /> {autor.disclaimer}
                </p>
              )}
            </div>

            {/* o mito de origem */}
            <aside className="relative overflow-hidden rounded-[28px] bg-[var(--mata)] text-[var(--lua)] p-7 sm:p-9">
              <div aria-hidden className="ceu-estrelado absolute inset-0" />
              <div className="relative">
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--kitsunebi)]">De onde vem o nome</p>
                <p className="mt-3 font-serif text-[1.8rem] font-bold leading-tight text-[var(--lua)]" style={FRAUNCES}>
                  O animal que <em className="text-[var(--ginkgo)]">indica o caminho</em>
                </p>
                <p className="mt-4 font-body text-[1.02rem] leading-relaxed text-[#D3DAD3]">
                  No parágrafo em que Jung chama a floresta de metáfora do inconsciente, uma nota descreve uma gravura de 1616: um homem persegue uma raposa que some num buraco da montanha onde fica o templo dos adeptos. O animal prestativo, diz Jung, indica o caminho que leva ao templo; a raposa é o Mercúrio evasivo, o condutor.
                </p>
                <p className="mt-4">
                  <SeloLocus>OC 13 §241, nota 5</SeloLocus>
                </p>
                <Figura nome="fig/raposa-so-a-cauda" alt="" className="absolute -right-4 -bottom-12 w-[120px] opacity-95" />
              </div>
            </aside>
          </div>
        </section>

        {Array.isArray(a.gostos) && a.gostos.length > 0 && (
          <section className="relative overflow-hidden py-16 sm:py-20 bg-[var(--nevoa)]">
            <Padronagem nome="ichimatsu" cor="#2E5240" opacidade={0.04} tam={44} />
            <div className={`relative ${W}`}>
              <Rotulo className="mb-4">Fora dos livros</Rotulo>
              <TituloSecao antes="Do que eu" pivo="gosto" />
              <ul className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {a.gostos.map((g) => {
                  const fig = FIGURA_DO_GOSTO[(g.titulo || '').toLowerCase()];
                  return (
                    <li key={g.titulo} className="flex flex-col items-center text-center rounded-[24px] bg-bg-card border border-linha p-5">
                      <span className="flex items-center justify-center w-24 h-24 rounded-full" style={{ background: fig?.disco || 'var(--fundo-2)' }}>
                        {fig ? <Figura nome={fig.fig} alt="" className="max-w-[62%] max-h-[62%] w-auto" /> : <Icone nome="pegada" size={36} className="text-accent" />}
                      </span>
                      <p className="mt-3 font-serif text-[1.3rem] font-bold text-text-bright" style={FRAUNCES}>{g.titulo}</p>
                      {g.detalhe && <p className="mt-1 font-body text-[0.92rem] leading-snug text-text">{g.detalhe}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        <ConverseComigo id="converse" />

        {settings.instagramLink && (
          <section className="pb-16">
            <div className={`${W} flex justify-center`}>
              <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <Icone nome="instagram" size={18} /> Me acompanhe no Instagram
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

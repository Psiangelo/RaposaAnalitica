'use client';

import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import VisibilityGate from '@/components/VisibilityGate';
import Newsletter from '@/components/ui/Newsletter';
import ProdutoCard from '@/components/loja/ProdutoCard';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import Rotulo from '@/components/raposa/Rotulo';
import { TituloSecao, FRAUNCES } from '@/components/raposa/Cabecalho';
import { useSitedata } from '@/lib/useSitedata';
import { getLoja, DEFAULT_LOJA, SITEDATA_KEYS } from '@/lib/sitedata';

const W = 'max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8';

/**
 * /loja — os materiais. Filtro por linha (guias de conceito, leituras
 * comentadas, a coleção completa, objetos), o destaque grande e a grade,
 * depois «Da minha mesa» (o que já está estudado no acervo) e as
 * prateleiras. A compra acontece na plataforma de pagamento de cada produto.
 */
export default function LojaClient() {
  const loja = useSitedata(getLoja, DEFAULT_LOJA, SITEDATA_KEYS.loja);
  const [linha, setLinha] = useState('');
  const visiveis = useMemo(() => (loja.produtos || []).filter((p) => p.status !== 'rascunho'), [loja]);
  const filtrados = linha ? visiveis.filter((p) => p.linha === linha) : visiveis;
  const destaque = !linha ? visiveis.find((p) => p.destaque) : null;
  const resto = destaque ? filtrados.filter((p) => p !== destaque) : filtrados;
  const aVenda = visiveis.some((p) => p.status === 'a-venda');
  const linhasComProduto = (loja.linhas || []).filter((l) => visiveis.some((p) => p.linha === l.id));

  return (
    <VisibilityGate visibilityKey="loja" title="Loja indisponível">
      <Navbar />
      <main id="conteudo">
        <PageHero
          eyebrow={loja.hero.eyebrow}
          title={loja.hero.title}
          emphasis={loja.hero.emphasis}
          lead={loja.hero.lead}
          figura="fig/raposa-noren"
          figuraAlt="A raposa espiando por trás da cortina de uma lojinha"
          disco="var(--papel-velho)"
          fundo="papel"
        >
          {!aVenda && loja.avisoSemProdutos && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ginkgo)] px-4 py-2 font-sans text-[14px] font-semibold text-[var(--tinta)]">
              <Icone nome="sino" size={16} /> {loja.avisoSemProdutos}
            </p>
          )}
        </PageHero>

        <section className="py-12 sm:py-16">
          <div className={W}>
            {linhasComProduto.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filtrar por linha">
                <button onClick={() => setLinha('')} className={`h-10 px-4 rounded-full font-sans text-[14px] font-semibold ${!linha ? 'bg-mata text-[var(--washi)]' : 'bg-bg-card border border-linha text-text hover:border-[var(--acento)]'}`}>
                  Tudo
                </button>
                {linhasComProduto.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLinha(linha === l.id ? '' : l.id)}
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-full font-sans text-[14px] font-semibold ${linha === l.id ? 'bg-mata text-[var(--washi)]' : 'bg-bg-card border border-linha text-text hover:border-[var(--acento)]'}`}
                  >
                    <Icone nome={l.icone} size={16} /> {l.nome}
                  </button>
                ))}
              </div>
            )}

            {destaque && (
              <div className="mb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center rounded-[30px] bg-[var(--fundo-2)] p-5 sm:p-8">
                <ProdutoCard produto={destaque} linhas={loja.linhas} grande />
                <div className="px-2">
                  <Rotulo className="mb-3">Em destaque</Rotulo>
                  <p className="font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-tight text-text-bright" style={FRAUNCES}>{destaque.titulo}</p>
                  {destaque.subtitulo && <p className="mt-2 font-serif italic text-[1.2rem] text-accent-bright">{destaque.subtitulo}</p>}
                  <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-text">{destaque.descricao}</p>
                </div>
              </div>
            )}

            {resto.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resto.map((p) => (
                  <ProdutoCard key={p.id} produto={p} linhas={loja.linhas} />
                ))}
              </div>
            ) : (
              !destaque && <p className="py-12 text-center font-serif italic text-[1.3rem] text-text-dim">Nada nesta prateleira ainda.</p>
            )}
          </div>
        </section>

        {loja.prova?.itens?.length > 0 && (
          <section className="noite relative overflow-hidden py-16 sm:py-20">
            <div aria-hidden className="ceu-estrelado absolute inset-0" />
            <div className={`relative ${W} grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center`}>
              <div>
                {loja.prova.rotulo && <Rotulo cor="text-[var(--kitsunebi)]" className="mb-4">{loja.prova.rotulo}</Rotulo>}
                <TituloSecao antes={loja.prova.titulo} pivo={loja.prova.pivo} />
                <Figura nome="fig/raposa-anotando" alt="A raposa de óculos anotando no caderninho" className="mt-8 w-[200px] hidden lg:block" />
              </div>
              <ul className="grid gap-4">
                {loja.prova.itens.map((it, i) => (
                  <li key={i} className="flex items-center gap-5 rounded-[22px] border-[1.5px] border-[rgb(242_235_220/0.16)] bg-[rgb(242_235_220/0.04)] px-5 py-4">
                    <span className="w-[86px] shrink-0 text-center font-serif text-[3.2rem] font-extrabold leading-none text-[var(--ginkgo)]" style={FRAUNCES}>{it.numero}</span>
                    <span className="font-body text-[1.05rem] leading-relaxed text-text">{it.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {linhasComProduto.length > 0 && (
          <section className="py-16 sm:py-20 bg-[var(--fundo-2)]">
            <div className={W}>
              <Rotulo className="mb-4">As prateleiras</Rotulo>
              <TituloSecao antes="O que tem em" pivo="cada prateleira" />
              <div className={`mt-10 grid gap-4 sm:grid-cols-2 ${linhasComProduto.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
                {linhasComProduto.map((l) => (
                  <div key={l.id} className="rounded-[24px] bg-bg-card border border-linha p-6">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-mata text-[var(--ginkgo)]">
                      <Icone nome={l.icone} size={22} />
                    </span>
                    <p className="mt-4 font-serif text-[1.35rem] font-bold text-text-bright" style={FRAUNCES}>{l.nome}</p>
                    <p className="mt-1.5 font-body text-[0.98rem] leading-relaxed text-text">{l.descricao}</p>
                  </div>
                ))}
              </div>
              {loja.avisoLegal && (
                <p className="mt-10 flex items-start gap-2.5 max-w-[70ch] font-sans text-[14px] leading-relaxed text-text-dim">
                  <Icone nome="selo" size={17} className="mt-0.5 shrink-0 text-[var(--urushi)]" /> {loja.avisoLegal}
                </p>
              )}
            </div>
          </section>
        )}

        <Newsletter source="loja" />
      </main>
      <Footer />
    </VisibilityGate>
  );
}

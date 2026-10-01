'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/ui/PageHero';
import VisibilityGate from '@/components/VisibilityGate';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import Rotulo from '@/components/raposa/Rotulo';
import Padronagem from '@/components/raposa/Padronagem';
import { TituloSecao, FRAUNCES } from '@/components/raposa/Cabecalho';
import { useSitedata } from '@/lib/useSitedata';
import { getServicos, DEFAULT_SERVICOS, getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';

const W = 'max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8';

function linkWhats(numero, mensagem) {
  const n = String(numero || '').replace(/\D/g, '');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(mensagem)}` : null;
}

/**
 * /servicos — pesquisa sob encomenda para quem escreve com Jung.
 * As peças (escopo fechado), como funciona, o que vem no PDF, o que não
 * se faz, e a chamada final para o WhatsApp ou e-mail.
 */
export default function ServicosClient() {
  const s = useSitedata(getServicos, DEFAULT_SERVICOS, SITEDATA_KEYS.servicos);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const pecas = (s.pecas || []).filter((p) => !p.oculto);
  const email = s.cta?.email || settings.emailAddress;
  const whatsGeral = linkWhats(settings.whatsappNumber, s.cta?.whatsappMensagem || 'Oi! Queria um orçamento de pesquisa. Tema: ');

  return (
    <VisibilityGate visibilityKey="servicos" title="Pesquisa indisponível">
      <Navbar />
      <main id="conteudo">
        <PageHero
          eyebrow={s.hero.eyebrow}
          title={s.hero.title}
          emphasis={s.hero.emphasis}
          lead={s.hero.lead}
          fundo="noite"
          sideCard={
            <Figura
              nome="fig/raposa-pescando-quadro"
              alt="A raposa pescando com a cauda num lago, sob a lua"
              prioridade
              className="w-full max-w-[380px] mx-auto -rotate-[1.5deg] [filter:drop-shadow(0_26px_34px_rgb(0_0_0/0.45))]"
            />
          }
          actions={
            whatsGeral && (
              <a href={whatsGeral} target="_blank" rel="noopener noreferrer" className="btn btn--ouro btn--lg">
                <Icone nome="whatsapp" size={19} /> {s.hero.primaryLabel || 'Pedir um orçamento'}
              </a>
            )
          }
        />

        {/* as peças */}
        <section className="py-16 sm:py-20">
          <div className={W}>
            <Rotulo className="mb-4">O que a raposa entrega</Rotulo>
            <TituloSecao antes="Quatro peças," pivo="escopo fechado" />
            <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[60ch]">
              Não se vende hora: cada peça tem escopo, formato e prazo combinados antes de começar. Você sabe o que vai receber.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {pecas.map((p) => {
                const w = linkWhats(settings.whatsappNumber, `Oi! Vim pela página de pesquisa da Raposa Analítica e queria um orçamento de «${p.nome}». Tema: `);
                return (
                  <article
                    id={p.id}
                    key={p.id}
                    className={`relative overflow-hidden flex flex-col rounded-[26px] p-6 sm:p-8 border-[1.5px] scroll-mt-28 ${p.destaque ? 'bg-[var(--papel-velho)] border-[var(--torii)]' : 'bg-bg-card border-linha'}`}
                  >
                    {p.destaque && <Padronagem nome="kikko" cor="#6B4A35" opacidade={0.08} tam={40} />}
                    <div className="relative flex items-start gap-4">
                      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-mata text-[var(--ginkgo)] shrink-0">
                        <Icone nome={p.icone} size={26} />
                      </span>
                      <div>
                        <h3 className="font-serif text-[1.7rem] font-bold leading-tight text-text-bright" style={FRAUNCES}>{p.nome}</h3>
                        {p.pergunta && <p className="font-serif italic text-[1.12rem] text-accent-bright">“{p.pergunta}”</p>}
                      </div>
                    </div>
                    <p className="relative mt-5 font-body text-[1.02rem] leading-relaxed text-text">{p.descricao}</p>
                    <dl className="relative mt-5 grid grid-cols-3 gap-3 font-sans text-[13.5px]">
                      {[['Entrega', p.entrega], ['Prazo', p.prazo], ['Preço', p.preco]].map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-[var(--fundo)] px-3 py-2.5">
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-dim">{k}</dt>
                          <dd className="mt-0.5 font-semibold text-text-bright">{v || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                    {w && (
                      <a href={w} target="_blank" rel="noopener noreferrer" className={`relative mt-6 self-start btn btn--sm ${p.destaque ? 'btn--wine' : 'btn--solid'}`}>
                        Pedir esta <Icone nome="seta" size={16} />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* como funciona */}
        {s.passos?.length > 0 && (
          <section className="relative overflow-hidden py-16 sm:py-20 bg-[var(--nevoa)]">
            <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.07} tam={48} />
            <div className={`relative ${W}`}>
              <Rotulo className="mb-4">Como funciona</Rotulo>
              <TituloSecao antes="Da pergunta" pivo="ao PDF" />
              <ol className="mt-10 grid gap-5 md:grid-cols-3">
                {s.passos.map((p, i) => (
                  <li key={i} className="relative rounded-[24px] bg-bg-card border border-linha p-6">
                    <span className="font-serif text-[3rem] font-extrabold leading-none text-[var(--torii)]" style={FRAUNCES}>{i + 1}</span>
                    <h3 className="mt-2 font-serif text-[1.35rem] font-bold text-text-bright" style={FRAUNCES}>{p.titulo}</h3>
                    <p className="mt-2 font-body text-[1rem] leading-relaxed text-text">{p.texto}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* o que vem no PDF */}
        <section className="py-16 sm:py-20 overflow-hidden">
          <div className={`${W} grid lg:grid-cols-2 gap-12 items-center`}>
            <div>
              <Rotulo className="mb-4">O que vem na entrega</Rotulo>
              <TituloSecao antes="Um PDF que você pode" pivo="mostrar ao orientador" />
              <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[52ch]">
                Toda entrega abre com o cabeçalho de método: o que foi varrido, em que edição, o que ficou de fora e por quê. Cada achado vem com a obra e o parágrafo, porque o parágrafo numerado da Obra Completa é o mesmo em qualquer edição: você confere na sua.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[28px] bg-[var(--mata)] rotate-[-2deg]" aria-hidden />
              <div className="relative rounded-[22px] bg-[#FBF8F1] p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgb(19_33_31/0.7)] font-body text-[0.95rem] text-[var(--tinta)]">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--urushi)]">Exemplo de cabeçalho</p>
                <p className="mt-2 font-serif text-[1.4rem] font-bold leading-tight" style={FRAUNCES}>Localização: «floresta» como imagem do inconsciente</p>
                <dl className="mt-4 space-y-2 text-[0.92rem]">
                  <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="font-sans font-semibold text-[#56655D]">Corpus</dt><dd>Obra Completa (edição brasileira, Vozes), volumes cobertos listados um a um</dd></div>
                  <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="font-sans font-semibold text-[#56655D]">Critério</dt><dd>ocorrências do termo e passagens que tratam do tema sem nomeá-lo</dd></div>
                  <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="font-sans font-semibold text-[#56655D]">Fora</dt><dd>cartas e seminários não publicados em português</dd></div>
                </dl>
                <div className="mt-5 pt-4 border-t border-[#D9CEB6]">
                  <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[#56655D]">Primeiro achado</p>
                  <p className="mt-1.5"><span className="inline-block font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F2EBDC] bg-[var(--torii)] px-2 py-0.5 rounded-[3px] -rotate-2 mr-2">OC 13 §241</span>a floresta como “metáfora apropriada para o inconsciente”, no comentário ao conto dos Grimm <i>O espírito na garrafa</i>.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* limites */}
        {s.limites?.length > 0 && (
          <section className="py-16 sm:py-20 bg-[var(--fundo-2)]">
            <div className={W}>
              <Rotulo className="mb-4">Combinado é combinado</Rotulo>
              <TituloSecao antes="O que a raposa" pivo="não faz" />
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {s.limites.map((l, i) => (
                  <li key={i} className="flex gap-4 items-start rounded-[22px] bg-bg-card border border-linha p-5">
                    <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full bg-[var(--fundo-2)] text-[var(--urushi)] shrink-0">
                      <Icone nome="selo" size={18} />
                    </span>
                    <p className="font-body text-[1rem] leading-relaxed text-text">{l}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* chamada final */}
        <section className="noite relative overflow-hidden py-16 sm:py-20">
          <div aria-hidden className="ceu-estrelado absolute inset-0" />
          <div className={`relative ${W} grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center`}>
            <div>
              <TituloSecao antes={s.cta?.titulo || 'Tem uma pergunta para a raposa?'} />
              {s.cta?.texto && <p className="mt-4 font-body text-[1.1rem] leading-relaxed text-text max-w-[50ch]">{s.cta.texto}</p>}
              <div className="btn-row mt-7">
                {whatsGeral && (
                  <a href={whatsGeral} target="_blank" rel="noopener noreferrer" className="btn btn--ouro btn--lg">
                    <Icone nome="whatsapp" size={19} /> Pedir pelo WhatsApp
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}?subject=${encodeURIComponent('Pedido de pesquisa')}`} className="btn btn--ghost btn--lg">
                    <Icone nome="email" size={19} /> {email}
                  </a>
                )}
              </div>
            </div>
            <Figura nome="fig/raposa-daruma" alt="A raposa ao lado de um daruma, o boneco das metas" className="w-[260px] mx-auto" />
          </div>
        </section>
      </main>
      <Footer />
    </VisibilityGate>
  );
}

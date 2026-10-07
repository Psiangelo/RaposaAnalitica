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
const QUANTOS = ['Nenhum nível', 'Um nível', 'Dois níveis', 'Três níveis', 'Quatro níveis', 'Cinco níveis'];

function linkWhats(numero, mensagem) {
  const n = String(numero || '').replace(/\D/g, '');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(mensagem)}` : null;
}

/**
 * /servicos — pesquisa sob encomenda para quem escreve com Jung.
 *
 * Um serviço só: a pesquisa na obra inteira sobre o tema que a pessoa
 * trouxer, em três níveis de entrega bem separados, com a
 * opção de mandar o texto que já tem. Depois: como funciona, o que vem no
 * PDF, os roteiros sobre Jung para quem faz conteúdo, o que eu não faço e
 * a chamada final.
 */
export default function ServicosClient() {
  const s = useSitedata(getServicos, DEFAULT_SERVICOS, SITEDATA_KEYS.servicos);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const niveis = (s.pecas || []).filter((p) => !p.oculto);
  const sv = s.servico || {};
  const rt = s.roteiros || {};
  const email = s.cta?.email || settings.emailAddress;
  const whatsGeral = linkWhats(settings.whatsappNumber, s.cta?.whatsappMensagem || 'Oi! Queria um orçamento de pesquisa. Tema: ');
  const whatsRoteiro = linkWhats(settings.whatsappNumber, rt.whatsappMensagem || 'Oi! Queria um roteiro sobre Jung. Tema e formato: ');

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

        {/* o serviço */}
        {(sv.titulo || sv.texto) && (
          <section className="py-16 sm:py-20">
            <div className={`${W} grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-start`}>
              <div>
                {sv.rotulo && <Rotulo className="mb-4">{sv.rotulo}</Rotulo>}
                <TituloSecao antes={sv.titulo} pivo={sv.pivo} />
                {sv.texto && <p className="mt-5 font-body text-[1.1rem] leading-relaxed text-text max-w-[58ch]">{sv.texto}</p>}
                {sv.temas?.length > 0 && (
                  <>
                    <p className="mt-9 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-text-dim">O tema pode ser</p>
                    <ul className="mt-3 grid sm:grid-cols-2 gap-3">
                      {sv.temas.map((t, i) => (
                        <li key={i} className="flex gap-3 items-start rounded-[18px] bg-bg-card border border-linha px-4 py-3.5">
                          <span aria-hidden className="mt-[0.55rem] w-2 h-2 rounded-full bg-[var(--torii)] shrink-0" />
                          <span>
                            <span className="block font-serif text-[1.15rem] font-bold leading-tight text-text-bright" style={FRAUNCES}>{t.titulo}</span>
                            {t.exemplo && <span className="mt-0.5 block font-body italic text-[0.97rem] leading-snug text-text-dim">{t.exemplo}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              {sv.textoProprio && (
                <aside className="relative overflow-hidden rounded-[26px] border-[1.5px] border-[var(--tronco)] p-6 sm:p-8 lg:mt-16 shadow-[5px_5px_0_var(--tronco)]" style={{ background: 'var(--papel-velho)' }}>
                  <Padronagem nome="asanoha" cor="#6B4A35" opacidade={0.08} tam={40} />
                  <div className="relative">
                    <span className="flex items-center justify-center w-12 h-12 rounded-[14px] -rotate-[5deg] text-[var(--washi)]" style={{ background: 'var(--tronco)' }}>
                      <Icone nome="pergaminho" size={24} />
                    </span>
                    <p className="mt-4 font-serif text-[1.7rem] font-bold leading-tight text-[var(--tinta)]" style={FRAUNCES}>{sv.textoProprioTitulo}</p>
                    <p className="mt-3 font-body text-[1.04rem] leading-relaxed text-[var(--tinta)]">{sv.textoProprio}</p>
                  </div>
                </aside>
              )}
            </div>
          </section>
        )}

        {/* os níveis */}
        {niveis.length > 0 && (
          <section className="relative overflow-hidden py-16 sm:py-20 bg-[var(--fundo-2)]">
            <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.05} tam={48} />
            <div className={`relative ${W}`}>
              <Rotulo className="mb-4">Níveis de entrega</Rotulo>
              <TituloSecao antes={QUANTOS[niveis.length] || `${niveis.length} níveis`} pivo="de entrega" />
              <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[62ch]">
                Não vendo hora: cada nível tem escopo, formato e prazo combinados antes de começar.
              </p>
              <div className="mt-12 grid gap-6 lg:grid-cols-3 items-stretch">
                {niveis.map((p, i) => {
                  const w = linkWhats(settings.whatsappNumber, `Oi! Vim pela página de pesquisa da Raposa Analítica e queria um orçamento do nível ${p.nome}. Tema: `);
                  const escuro = p.destaque;
                  return (
                    <article
                      id={p.id}
                      key={p.id}
                      className={`relative overflow-hidden flex flex-col rounded-[26px] border-2 p-6 sm:p-7 scroll-mt-28 ${escuro ? 'noite lg:-translate-y-3' : 'bg-bg-card'}`}
                      style={{
                        borderColor: escuro ? 'var(--mata)' : 'var(--tinta)',
                        boxShadow: `5px 5px 0 ${escuro ? 'var(--ginkgo)' : 'var(--tinta)'}`,
                        ...(escuro ? { background: 'var(--mata)' } : {}),
                      }}
                    >
                      {escuro && <Padronagem nome="asanoha" cor="#E9C85E" opacidade={0.07} tam={40} />}
                      <div className="relative flex items-center justify-between gap-3">
                        <span
                          className="flex items-center justify-center w-12 h-12 rounded-[14px] -rotate-[5deg]"
                          style={escuro ? { background: 'var(--ginkgo)', color: 'var(--tinta)' } : { background: 'var(--mata)', color: 'var(--ginkgo)' }}
                        >
                          <Icone nome={p.icone} size={24} />
                        </span>
                      </div>
                      <h3 className="relative mt-5 font-serif text-[2rem] font-bold leading-none text-text-bright" style={FRAUNCES}>{p.nome}</h3>
                      {p.pergunta && <p className={`relative mt-2 font-serif italic text-[1.12rem] ${escuro ? 'text-[var(--ginkgo)]' : 'text-accent-bright'}`}>{p.pergunta}</p>}
                      <p className="relative mt-4 font-body text-[1.01rem] leading-relaxed text-text">{p.descricao}</p>
                      <dl className="relative mt-6 pt-4 border-t border-linha space-y-2 font-sans text-[14px]">
                        {[['Entrega', p.entrega], ['Prazo', p.prazo], ['Preço', p.preco]].map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[76px_1fr] gap-3">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-dim pt-[3px]">{k}</dt>
                            <dd className="font-semibold text-text-bright">{v || 'a combinar'}</dd>
                          </div>
                        ))}
                      </dl>
                      {w && (
                        <div className="relative mt-auto pt-6">
                          <a href={w} target="_blank" rel="noopener noreferrer" className={`btn btn--sm ${escuro ? 'btn--ouro' : 'btn--solid'}`}>
                            Pedir este nível <Icone nome="seta" size={16} />
                          </a>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* como funciona */}
        {s.passos?.length > 0 && (
          <section className="relative overflow-hidden py-16 sm:py-20 bg-[var(--nevoa)]">
            <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.07} tam={48} />
            <div className={`relative ${W}`}>
              <Rotulo className="mb-4">Como funciona</Rotulo>
              <TituloSecao antes="Do tema" pivo="ao PDF" />
              <ol className={`mt-10 grid gap-5 md:grid-cols-2 ${s.passos.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                {s.passos.map((p, i) => (
                  <li key={i} className="relative rounded-[24px] bg-bg-card border border-linha p-6">
                    <span className="font-serif text-[3rem] font-extrabold leading-none text-[var(--torii)]" style={FRAUNCES}>{i + 1}</span>
                    <h3 className="mt-2 font-serif text-[1.35rem] font-bold leading-tight text-text-bright" style={FRAUNCES}>{p.titulo}</h3>
                    <p className="mt-2 font-body text-[1rem] leading-relaxed text-text">{p.texto}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* roteiros sobre Jung */}
        {rt.ativo && (rt.titulo || rt.texto) && (
          <section className="noite relative overflow-hidden py-16 sm:py-20">
            <Padronagem nome="sazanami" cor="#F2EBDC" opacidade={0.05} tam={44} />
            <div className={`relative ${W} grid lg:grid-cols-[0.75fr_1.25fr] gap-10 items-center`}>
              <div className="relative mx-auto w-full max-w-[300px] aspect-square">
                <div aria-hidden className="absolute inset-[6%] rounded-full bg-[var(--noite)]" />
                <Figura nome="fig/raposa-pergaminho" alt="A raposa com um pergaminho na boca" className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[58%]" />
              </div>
              <div>
                {rt.rotulo && <Rotulo cor="text-[var(--kitsunebi)]" className="mb-4">{rt.rotulo}</Rotulo>}
                <TituloSecao antes={rt.titulo} pivo={rt.pivo} />
                {rt.texto && <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[56ch]">{rt.texto}</p>}
                {rt.formatos?.some(Boolean) && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {rt.formatos.filter(Boolean).map((f) => (
                      <li key={f} className="rounded-full border-[1.5px] border-[rgb(242_235_220/0.3)] px-4 py-1.5 font-sans text-[14px] font-semibold text-text-bright">{f}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  {whatsRoteiro && (
                    <a href={whatsRoteiro} target="_blank" rel="noopener noreferrer" className="btn btn--ouro">
                      <Icone nome="whatsapp" size={18} /> {rt.botao || 'Pedir um roteiro'}
                    </a>
                  )}
                  {rt.preco && <span className="font-sans text-[14px] text-text-dim">Preço: {rt.preco}</span>}
                </div>
              </div>
            </div>
          </section>
        )}


        {/* chamada final */}
        <section className="noite relative overflow-hidden py-16 sm:py-20">
          <div aria-hidden className="ceu-estrelado absolute inset-0" />
          <div className={`relative ${W} grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center`}>
            <div>
              <TituloSecao antes={s.cta?.titulo || 'Tem uma pergunta? Me conta.'} />
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

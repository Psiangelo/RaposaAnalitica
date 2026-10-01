'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSitedata } from '@/lib/useSitedata';
import {
  getBlogPosts, getGlossario, getGlossarioCategories, mascaraInfo, getTrilhas,
  getServicos, DEFAULT_SERVICOS, getLoja, DEFAULT_LOJA, getHomepage, DEFAULT_HOMEPAGE,
  getBio, DEFAULT_BIO, getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS,
} from '@/lib/sitedata';
import { ordenarPublicados } from '@/lib/ensaios';
import { useTrilhaProgress } from '@/lib/useTrilhaProgress';
import EnsaioCard from '@/components/blog/EnsaioCard';
import Cabecalho, { TituloSecao, FRAUNCES } from '@/components/raposa/Cabecalho';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import Rotulo from '@/components/raposa/Rotulo';
import ToriiMarco from '@/components/raposa/ToriiMarco';
import Padronagem from '@/components/raposa/Padronagem';
import ProdutoCard from '@/components/loja/ProdutoCard';
import { BASE_PATH } from '@/lib/site';
import { useSectionLabel } from '@/lib/useLabels';

const W = 'max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8';

export function usePublicados() {
  const posts = useSitedata(getBlogPosts, [], SITEDATA_KEYS.blog);
  return useMemo(() => ordenarPublicados(posts), [posts]);
}

/* ------------------------------------------------------------ ensaios */
export function EnsaioDestaque() {
  const posts = usePublicados();
  if (!posts.length) return null;
  return (
    <section className="pt-10 pb-8">
      <div className={W}>
        <EnsaioCard post={posts[0]} variante="destaque" />
      </div>
    </section>
  );
}

export function UltimosEnsaios({ pular = 1, limite = 6 }) {
  const posts = usePublicados().slice(pular, pular + limite);
  const titulo = useSectionLabel('blog', 'Da *clareira*');
  if (!posts.length) return null;
  return (
    <section className="relative py-16 sm:py-20">
      <div className={W}>
        <Cabecalho
          rotulo="Ensaios"
          texto={titulo}
          lead="Uma pergunta de cada vez, com a referência de cada coisa."
          link="/blog"
          linkLabel="Todos os ensaios"
          className="mb-10"
        />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <EnsaioCard key={p.id || p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ verbetes */
export function MascaraVerbete({ categoria, mascara, tamanho = 'md', className = '' }) {
  const m = mascaraInfo(mascara || categoria?.mascara);
  const dim = tamanho === 'lg' ? 'w-[132px] h-[132px]' : tamanho === 'sm' ? 'w-[52px] h-[52px]' : 'w-[96px] h-[96px]';
  return (
    <span className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${dim} ${className}`} style={{ background: m.fundo }}>
      <Figura nome={`mascara/${m.id}`} alt="" className="w-[62%]" />
    </span>
  );
}

export function VerbetesHome() {
  const glossario = useSitedata(getGlossario, [], SITEDATA_KEYS.glossario);
  const categorias = useSitedata(getGlossarioCategories, [], SITEDATA_KEYS.glossarioCategories);
  const lista = glossario.filter((g) => !g.hidden).slice(0, 10);
  const titulo = useSectionLabel('verbetes', 'As máscaras *da floresta*');
  if (!lista.length) return null;
  const cat = (slug) => categorias.find((c) => c.slug === slug) || { mascara: 'shiro' };
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-[var(--nevoa)]">
      <Padronagem nome="asanoha" cor="#2E5240" opacidade={0.07} tam={56} />
      <div className={`relative ${W}`}>
        <Cabecalho
          rotulo="Verbetes"
          texto={titulo}
          lead="Cada conceito de Jung com o essencial dito curto, e a cor da máscara dizendo de que família ele é. Dentro dos ensaios, o termo com um ? abre o verbete."
          link="/verbetes"
          linkLabel="Todos os verbetes"
          className="mb-10"
        />
        <ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {lista.map((g) => (
            <li key={g.slug} className="snap-start shrink-0 w-[220px]">
              <Link href={`/verbetes/${g.slug}/`} className="group flex flex-col h-full rounded-[22px] bg-bg-card border border-linha p-5 hover:-translate-y-1 hover:shadow-[0_18px_40px_-28px_rgb(19_33_31/0.7)] transition-all">
                <MascaraVerbete categoria={cat(g.category)} mascara={g.mascara} className="group-hover:rotate-[-4deg] transition-transform" />
                <span className="mt-4 font-serif text-[1.35rem] font-bold text-text-bright leading-tight" style={FRAUNCES}>{g.term}</span>
                <span className="mt-1.5 font-body text-[0.92rem] leading-snug text-text line-clamp-3">{g.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ trilhas */
export function TrilhasHome() {
  const trilhas = useSitedata(getTrilhas, [], SITEDATA_KEYS.trilhas);
  const { progress } = useTrilhaProgress();
  const lista = trilhas.filter((t) => !t.hidden).slice(0, 3);
  const titulo = useSectionLabel('estudos', 'O caminho dos *mil torii*');
  if (!lista.length) return null;
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className={`${W} grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center`}>
        <div className="relative order-2 lg:order-1">
          <div className="absolute inset-[6%] rounded-full bg-[var(--fundo-2)]" />
          <Figura nome="obj/tunel-de-torii" alt="O túnel de mil torii vermelhos do santuário de Inari" className="relative w-full max-w-[520px] mx-auto" />
          <Figura nome="fig/raposa-lanterna" alt="" className="absolute right-[2%] bottom-[-4%] w-[30%]" />
        </div>
        <div className="order-1 lg:order-2">
          <Rotulo className="mb-4">Trilhas</Rotulo>
          <TituloSecao texto={titulo} />
          <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[52ch]">
            No santuário de Inari, cujas mensageiras são as raposas, o caminho é um túnel de portões vermelhos. Aqui cada etapa da trilha é um torii: você passa por ele e ele fica vermelho.
          </p>
          <ul className="mt-8 space-y-4">
            {lista.map((t) => {
              const etapas = Array.isArray(t.stages) ? t.stages.filter((s) => !s.hidden) : [];
              const feitas = progress?.[t.id]?.completedStages || [];
              const proxima = etapas.findIndex((s) => !feitas.includes(s.title));
              return (
                <li key={t.id}>
                  <Link href={`/trilhas/${t.slug || t.id}/`} className="group block rounded-[22px] bg-bg-card border border-linha p-5 sm:p-6 hover:border-[var(--torii)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-[1.45rem] font-bold text-text-bright leading-tight" style={FRAUNCES}>{t.name}</p>
                        <p className="mt-1 font-sans text-[13px] text-text-dim">
                          {[t.level, etapas.length ? `${etapas.length} ${etapas.length === 1 ? 'etapa' : 'etapas'}` : null, t.duration].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <Icone nome="seta" size={20} className="text-accent mt-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                    {etapas.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {etapas.map((s, i) => (
                          <ToriiMarco
                            key={s.id || i}
                            estado={feitas.includes(s.title) ? 'feito' : i === (proxima === -1 ? -2 : proxima) ? 'curso' : 'vazio'}
                            tamanho={26}
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/trilhas" className="link-arrow mt-7">Ver todas as trilhas <Icone nome="seta" size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ pesquisa */
export function PesquisaHome() {
  const s = useSitedata(getServicos, DEFAULT_SERVICOS, SITEDATA_KEYS.servicos);
  const pecas = (s.pecas || []).filter((p) => !p.oculto);
  return (
    <section className="noite relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden className="ceu-estrelado absolute inset-0 pointer-events-none" />
      <div className={`relative ${W} grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center`}>
        <div>
          <Rotulo cor="text-[var(--kitsunebi)]" className="mb-4">{s.hero.eyebrow}</Rotulo>
          <TituloSecao antes={s.hero.title} pivo={s.hero.emphasis} />
          <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[54ch]">{s.hero.lead}</p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {pecas.map((p) => (
              <li key={p.id} className="rounded-2xl bg-bg-card border border-linha p-4">
                <p className="flex items-center gap-2.5 font-serif text-[1.15rem] font-semibold text-text-bright" style={FRAUNCES}>
                  <Icone nome={p.icone} size={19} className="text-[var(--ginkgo)]" /> {p.nome}
                </p>
                <p className="mt-1 font-body italic text-[0.95rem] text-text-dim">“{p.pergunta}”</p>
              </li>
            ))}
          </ul>
          <div className="btn-row mt-8">
            <Link href="/servicos" className="btn btn--ouro btn--lg">
              Ver como funciona <Icone nome="seta" size={18} />
            </Link>
          </div>
        </div>
        <div className="relative">
          <Figura
            nome="fig/raposa-pescando-quadro"
            alt="A raposa pescando com a cauda num lago, sob a lua"
            className="relative w-full max-w-[460px] mx-auto -rotate-[1.5deg] [filter:drop-shadow(0_26px_34px_rgb(0_0_0/0.45))]"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ loja */
export function LojaHome() {
  const loja = useSitedata(getLoja, DEFAULT_LOJA, SITEDATA_KEYS.loja);
  const produtos = (loja.produtos || []).filter((p) => p.status !== 'rascunho').slice(0, 3);
  if (!produtos.length) return null;
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className={W}>
        <div className="flex flex-col lg:flex-row lg:items-end gap-8 mb-10">
          <div className="flex-1">
            <Cabecalho rotulo={loja.hero.eyebrow} antes={loja.hero.title} pivo={loja.hero.emphasis} lead={loja.hero.lead} />
          </div>
          <Figura nome="fig/raposa-noren" alt="A raposa espiando por trás da cortina de uma lojinha" className="w-[220px] self-center lg:self-end" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p) => (
            <ProdutoCard key={p.id} produto={p} linhas={loja.linhas} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/loja" className="btn btn--ghost">
            <Icone nome="sacola" size={18} /> Entrar na loja
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ quem escreve */
export function QuemEscreve({ compacto = false }) {
  const home = useSitedata(getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS.homepage);
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const a = { ...DEFAULT_HOMEPAGE.about, ...(home?.about || {}) };
  const autor = bio?.author || DEFAULT_BIO.author;
  const titulo = useSectionLabel('about', 'Sou uma raposa *estudante* de psicologia');
  return (
    <section id="quem-escreve" className="relative overflow-hidden py-16 sm:py-24 bg-[var(--fundo-2)]">
      <Padronagem nome="seigaiha" cor="#2E5240" opacidade={0.06} tam={52} />
      <div className={`relative ${W} grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center`}>
        <div className="relative mx-auto w-full max-w-[420px] aspect-square">
          <div className="absolute inset-0 rounded-full bg-[var(--kaki)] opacity-90" />
          <div className="absolute inset-[9%] rounded-full bg-[var(--papel-velho)]" />
          <Figura nome="fig/raposa-anotando" alt={autor.photo?.alt || 'A raposa de óculos anotando no caderninho'} className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[74%]" />
        </div>
        <div>
          <Rotulo className="mb-4">{a.title || 'Quem sou eu'}</Rotulo>
          <TituloSecao texto={titulo} />
          {a.paragraph1 && <p className="mt-5 font-body text-[1.08rem] leading-relaxed text-text max-w-[58ch]">{a.paragraph1}</p>}
          {!compacto && a.paragraph2 && <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[58ch]">{a.paragraph2}</p>}
          {Array.isArray(a.gostos) && a.gostos.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {a.gostos.map((g) => (
                <li key={g.titulo} className="rounded-full bg-bg-card border border-linha px-3.5 py-1.5 font-sans text-[14px] text-text" title={g.detalhe}>
                  <span className="font-semibold text-text-bright">{g.titulo}</span>
                </li>
              ))}
            </ul>
          )}
          {autor.disclaimer && <p className="mt-5 font-sans text-[14px] text-text-dim">{autor.disclaimer}</p>}
          <Link href="/sobre" className="link-arrow mt-7">Mais sobre mim <Icone nome="seta" size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ converse comigo */
export function ConverseComigo({ id = 'converse' }) {
  const home = useSitedata(getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS.homepage);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const c = { ...DEFAULT_HOMEPAGE.contact, ...(home?.contact || {}) };
  const num = String(c.whatsappNumber || settings.whatsappNumber || '').replace(/\D/g, '');
  const msg = encodeURIComponent(settings.whatsappMessage || 'Oi! Vim pelo site da Raposa Analítica.');
  const email = c.emailValue || settings.emailAddress;
  return (
    <section id={id} className="relative overflow-hidden py-16 sm:py-24">
      <div className={W}>
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--papel-velho)]">
          <Padronagem nome="seigaiha" cor="#6B4A35" opacidade={0.1} tam={44} />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="p-7 sm:p-12">
              <Rotulo className="mb-4">{c.sectionLabel}</Rotulo>
              <TituloSecao antes={c.title?.replace(/shoji$/i, '').trim() || 'Bata no'} pivo={/shoji$/i.test(c.title || '') ? 'shoji' : ''} />
              <p className="mt-4 font-body text-[1.08rem] leading-relaxed text-text max-w-[50ch]">{c.lead}</p>
              <div className="mt-7 rounded-2xl bg-bg-card border border-linha p-5 max-w-[520px]">
                <p className="font-sans text-[12px] font-semibold tracking-[0.18em] uppercase text-text-dim">{c.primaryLabel}</p>
                <p className="mt-1 font-serif text-[1.5rem] font-bold text-text-bright" style={FRAUNCES}>
                  {c.primaryHeadingPrefix} <em className="italic text-accent-bright">{c.primaryHeadingEmphasis}</em>
                </p>
                <p className="mt-1.5 font-body text-[0.98rem] text-text">{c.primaryText}</p>
                {num && (
                  <a href={`https://wa.me/${num}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="btn btn--solid mt-4">
                    <Icone nome="whatsapp" size={19} /> {c.primaryButton}
                  </a>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[15px]">
                {c.instagramUrl && (
                  <a href={c.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-text hover:text-accent">
                    <Icone nome="instagram" size={18} /> {c.instagramValue || 'Instagram'}
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-text hover:text-accent">
                    <Icone nome="email" size={18} /> {email}
                  </a>
                )}
              </div>
            </div>
            <div className="relative h-[260px] lg:h-full lg:min-h-[460px]">
              <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[78%] max-w-[360px] aspect-square rounded-full bg-[var(--washi)]" />
              <Figura nome="fig/raposa-shoji" alt="A raposa espiando por um furo no papel do shoji" className="absolute right-[14%] top-1/2 -translate-y-1/2 w-[64%] max-w-[300px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { BASE_PATH };

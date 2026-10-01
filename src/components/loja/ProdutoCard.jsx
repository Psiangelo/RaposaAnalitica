'use client';

import Link from 'next/link';
import { resolveImageSrc } from '@/lib/basepath';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import Padronagem from '@/components/raposa/Padronagem';
import { FRAUNCES } from '@/components/raposa/Cabecalho';

const COR_LINHA = {
  guia: { fundo: '#2E4C7A', padrao: 'asanoha' },
  leitura: { fundo: '#6B4A35', padrao: 'tatewaku' },
  cotejo: { fundo: '#962B24', padrao: 'ichimatsu' },
  objeto: { fundo: '#2E5240', padrao: 'kanoko' },
};

/**
 * Card de produto da loja. A capa é a imagem do produto ou, sem ela, a
 * figura do banco num campo com a cor e a padronagem da linha.
 * Status «em-breve» troca o botão de compra por «avise-me».
 */
export default function ProdutoCard({ produto: p, linhas = [], grande = false }) {
  const linha = linhas.find((l) => l.id === p.linha);
  const estilo = COR_LINHA[p.linha] || COR_LINHA.objeto;
  const aVenda = p.status === 'a-venda' && p.link;
  return (
    <article id={p.id} className="group flex flex-col h-full rounded-[24px] overflow-hidden bg-bg-card border border-linha scroll-mt-28">
      <div className={`relative overflow-hidden ${grande ? 'aspect-[4/3]' : 'aspect-[5/4]'}`} style={{ background: estilo.fundo }}>
        {p.capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageSrc(p.capa)} alt={p.titulo} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <Padronagem nome={estilo.padrao} cor="#F2EBDC" opacidade={0.16} tam={40} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] aspect-square rounded-full bg-[rgb(242_235_220/0.14)]" />
            {p.figura && <Figura nome={p.figura} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[38%] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-[-3deg]" />}
          </>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--washi)] px-3 py-1 font-sans text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--tinta)]">
          {linha?.nome || p.linha || 'Material'}
        </span>
        {p.status === 'em-breve' && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--ginkgo)] px-3 py-1 font-sans text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--tinta)]">Em breve</span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="font-serif text-[1.4rem] leading-[1.12] font-bold text-text-bright" style={FRAUNCES}>{p.titulo}</h3>
        {p.subtitulo && <p className="mt-1 font-serif italic text-[1rem] text-accent-bright">{p.subtitulo}</p>}
        {p.descricao && <p className="mt-3 font-body text-[0.96rem] leading-relaxed text-text line-clamp-4">{p.descricao}</p>}
        <p className="mt-3 font-sans text-[13px] text-text-dim">{[p.formato, p.paginas && `${p.paginas} páginas`].filter(Boolean).join(' · ')}</p>
        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          {aVenda ? (
            <>
              <span className="font-serif text-[1.5rem] font-bold text-text-bright">
                {p.precoAntigo && <s className="mr-2 text-[1rem] font-normal text-text-dim">{p.precoAntigo}</s>}
                {p.preco}
              </span>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn btn--wine btn--sm">
                <Icone nome="sacola" size={16} /> Comprar
              </a>
            </>
          ) : (
            <Link href="/newsletter" className="btn btn--ghost btn--sm">
              <Icone nome="carta" size={16} /> Me avise quando sair
            </Link>
          )}
        </div>
        {p.amostra && (
          <a href={p.amostra} target="_blank" rel="noopener noreferrer" className="mt-3 font-sans text-[14px] text-accent underline underline-offset-2">
            Ver uma amostra
          </a>
        )}
      </div>
    </article>
  );
}

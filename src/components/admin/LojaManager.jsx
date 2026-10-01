'use client';

import { useEffect, useState } from 'react';
import { getLoja, setLoja, DEFAULT_LOJA, LOJA_STATUS } from '@/lib/sitedata';
import { ICONES, ICONE_ROTULO } from '@/components/raposa/Icone';
import FeaturedImagePicker from '@/components/admin/FeaturedImagePicker';
import FiguraPicker from '@/components/admin/FiguraPicker';
import { CARD, BTN, BTN2, BTN_PERIGO, Campo, Texto, Area, Escolha, Chave, Secao, mover, novoId } from '@/components/admin/ui';

const OPCOES_ICONE = ICONES.map((i) => ({ id: i, label: ICONE_ROTULO[i] || i }));

function slug(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || novoId('produto');
}

/**
 * Admin → Loja. Produtos com status (rascunho, em breve, à venda) e o link
 * do checkout de fora (Hotmart, Kiwify, Mercado Pago, Gumroad…).
 */
export default function LojaManager({ addToast, addLogEntry }) {
  const [l, setL] = useState(DEFAULT_LOJA);
  const [sujo, setSujo] = useState(false);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    setL(getLoja());
  }, []);

  const muda = (fn) => {
    setL((atual) => fn(structuredClone(atual)));
    setSujo(true);
  };

  const salvar = () => {
    setLoja(l);
    setSujo(false);
    addToast?.('Loja salva. Lembre de publicar.', 'success');
    addLogEntry?.('Loja', `${l.produtos.length} produtos`);
  };

  const linhas = [{ id: '', nome: '(sem linha)' }, ...l.linhas.map((x) => ({ id: x.id, nome: x.nome }))];

  return (
    <div className="max-w-4xl">
      <div className="sticky top-[57px] z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 mb-4 bg-[rgb(var(--fundo-rgb)/0.95)] flex items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">
          A página <b>/loja</b> e a vitrine da home. {sujo && <span className="text-[rgb(var(--rubedo-rgb))]">Há alterações não salvas.</span>}
        </p>
        <button onClick={salvar} className={BTN} disabled={!sujo}>Salvar</button>
      </div>

      <Secao
        titulo="Produtos"
        descricao="«Em breve» aparece com o botão «me avise» (que leva às Cartas). «À venda» precisa do preço e do link do checkout. «Rascunho» não aparece."
        acoes={
          <button
            className={BTN2}
            onClick={() => {
              const id = novoId('produto');
              muda((x) => (x.produtos.unshift({ id, linha: x.linhas[0]?.id || '', titulo: 'Novo produto', subtitulo: '', descricao: '', preco: '', precoAntigo: '', link: '', status: 'rascunho', capa: '', figura: 'obj/livro', formato: 'PDF', paginas: '', amostra: '', destaque: false }), x));
              setAberto(id);
            }}
          >
            + produto
          </button>
        }
      >
        <div className="space-y-3">
          {l.produtos.map((p, i) => {
            const abre = aberto === p.id;
            const st = LOJA_STATUS.find((s) => s.id === p.status);
            return (
              <div key={p.id} className={CARD}>
                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setAberto(abre ? null : p.id)} className="text-left min-w-0 flex-1">
                    <p className="font-serif text-[1.15rem] text-[rgb(var(--texto-forte-rgb))] truncate">{p.titulo || 'Sem título'}</p>
                    <p className="font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))]">
                      {st?.label} · {l.linhas.find((x) => x.id === p.linha)?.nome || 'sem linha'} {p.preco && `· ${p.preco}`}
                    </p>
                  </button>
                  <div className="flex gap-1.5 shrink-0">
                    <button className={BTN2} onClick={() => muda((x) => ((x.produtos = mover(x.produtos, i, -1)), x))}>↑</button>
                    <button className={BTN2} onClick={() => muda((x) => ((x.produtos = mover(x.produtos, i, 1)), x))}>↓</button>
                    <button className={BTN2} onClick={() => setAberto(abre ? null : p.id)}>{abre ? 'Fechar' : 'Editar'}</button>
                  </div>
                </div>
                {abre && (
                  <div className="mt-4 pt-4 border-t border-[rgb(var(--linha-rgb))] grid sm:grid-cols-2 gap-3">
                    <Campo label="Título"><Texto value={p.titulo} onChange={(v) => muda((x) => ((x.produtos[i].titulo = v), x))} /></Campo>
                    <Campo label="Subtítulo"><Texto value={p.subtitulo} onChange={(v) => muda((x) => ((x.produtos[i].subtitulo = v), x))} /></Campo>
                    <Campo label="Linha"><Escolha value={p.linha} onChange={(v) => muda((x) => ((x.produtos[i].linha = v), x))} opcoes={linhas} /></Campo>
                    <Campo label="Situação"><Escolha value={p.status} onChange={(v) => muda((x) => ((x.produtos[i].status = v), x))} opcoes={LOJA_STATUS} /></Campo>
                    <Campo label="Descrição" className="sm:col-span-2"><Area value={p.descricao} onChange={(v) => muda((x) => ((x.produtos[i].descricao = v), x))} rows={3} /></Campo>
                    <Campo label="Preço" dica="Como aparece: «R$ 87»."><Texto value={p.preco} onChange={(v) => muda((x) => ((x.produtos[i].preco = v), x))} /></Campo>
                    <Campo label="Preço antigo (riscado, opcional)"><Texto value={p.precoAntigo} onChange={(v) => muda((x) => ((x.produtos[i].precoAntigo = v), x))} /></Campo>
                    <Campo label="Link do checkout" className="sm:col-span-2" dica="A página de pagamento (Hotmart, Kiwify, Mercado Pago, Gumroad…). O botão «Comprar» abre esse link.">
                      <Texto value={p.link} onChange={(v) => muda((x) => ((x.produtos[i].link = v), x))} placeholder="https://pay.hotmart.com/…" />
                    </Campo>
                    <Campo label="Formato"><Texto value={p.formato} onChange={(v) => muda((x) => ((x.produtos[i].formato = v), x))} placeholder="PDF, ePub, camiseta…" /></Campo>
                    <Campo label="Páginas"><Texto value={p.paginas} onChange={(v) => muda((x) => ((x.produtos[i].paginas = v), x))} /></Campo>
                    <Campo label="Link de amostra (opcional)" className="sm:col-span-2"><Texto value={p.amostra} onChange={(v) => muda((x) => ((x.produtos[i].amostra = v), x))} /></Campo>
                    <Campo label="Figura (sem capa própria)" className="sm:col-span-2">
                      <FiguraPicker value={p.figura} onChange={(v) => muda((x) => ((x.produtos[i].figura = v), x))} />
                    </Campo>
                    <div className="sm:col-span-2">
                      <span className="block text-[11px] uppercase tracking-[0.14em] font-semibold text-[rgb(var(--texto-dim-rgb))] font-sans mb-1.5">Capa própria (opcional)</span>
                      <FeaturedImagePicker value={p.capa} alt={p.titulo} onChange={(v) => muda((x) => ((x.produtos[i].capa = v), x))} onAltChange={() => {}} />
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between pt-2">
                      <Chave ligado={p.destaque} onChange={(v) => muda((x) => ((x.produtos[i].destaque = v), x))} label="Destaque (aparece grande no topo da loja)" />
                      <button className={BTN_PERIGO} onClick={() => confirm(`Apagar «${p.titulo}»?`) && muda((x) => (x.produtos.splice(i, 1), x))}>Apagar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Secao>

      <Secao
        titulo="Linhas de produto"
        descricao="Guias, leituras comentadas, cotejos, objetos… Servem de filtro na loja."
        acoes={<button className={BTN2} onClick={() => muda((x) => (x.linhas.push({ id: novoId('linha'), nome: 'Nova linha', descricao: '', icone: 'sacola' }), x))}>+ linha</button>}
      >
        <div className="space-y-3">
          {l.linhas.map((ln, i) => (
            <div key={ln.id} className={`${CARD} grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-start`}>
              <Campo label="Nome"><Texto value={ln.nome} onChange={(v) => muda((x) => ((x.linhas[i].nome = v), (x.linhas[i].id = x.linhas[i].id || slug(v)), x))} /></Campo>
              <Campo label="Ícone"><Escolha value={ln.icone} onChange={(v) => muda((x) => ((x.linhas[i].icone = v), x))} opcoes={OPCOES_ICONE} /></Campo>
              <div className="flex gap-1.5 pt-6">
                <button className={BTN2} onClick={() => muda((x) => ((x.linhas = mover(x.linhas, i, -1)), x))}>↑</button>
                <button className={BTN_PERIGO} onClick={() => confirm(`Apagar a linha «${ln.nome}»?`) && muda((x) => (x.linhas.splice(i, 1), x))}>×</button>
              </div>
              <Campo label="Descrição" className="sm:col-span-3"><Area value={ln.descricao} onChange={(v) => muda((x) => ((x.linhas[i].descricao = v), x))} rows={2} /></Campo>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Textos da página">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Rótulo"><Texto value={l.hero.eyebrow} onChange={(v) => muda((x) => ((x.hero.eyebrow = v), x))} /></Campo>
          <Campo label="Título (começo)"><Texto value={l.hero.title} onChange={(v) => muda((x) => ((x.hero.title = v), x))} /></Campo>
          <Campo label="Título (palavra em vermelho)"><Texto value={l.hero.emphasis} onChange={(v) => muda((x) => ((x.hero.emphasis = v), x))} /></Campo>
          <Campo label="Aviso quando não há nada à venda"><Texto value={l.avisoSemProdutos} onChange={(v) => muda((x) => ((x.avisoSemProdutos = v), x))} /></Campo>
          <Campo label="Texto de abertura" className="sm:col-span-2"><Area value={l.hero.lead} onChange={(v) => muda((x) => ((x.hero.lead = v), x))} rows={3} /></Campo>
        </div>
      </Secao>
    </div>
  );
}

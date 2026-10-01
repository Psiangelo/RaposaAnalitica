'use client';

import { useEffect, useState } from 'react';
import { getServicos, setServicos, DEFAULT_SERVICOS } from '@/lib/sitedata';
import { ICONES, ICONE_ROTULO } from '@/components/raposa/Icone';
import Icone from '@/components/raposa/Icone';
import { CARD, BTN, BTN2, BTN_PERIGO, Campo, Texto, Area, Escolha, Chave, Secao, mover, novoId } from '@/components/admin/ui';

const OPCOES_ICONE = ICONES.map((i) => ({ id: i, label: ICONE_ROTULO[i] || i }));

/** Admin → Pesquisa sob encomenda (/servicos). */
export default function ServicosManager({ addToast, addLogEntry }) {
  const [s, setS] = useState(DEFAULT_SERVICOS);
  const [sujo, setSujo] = useState(false);

  useEffect(() => {
    setS(getServicos());
  }, []);

  const muda = (fn) => {
    setS((atual) => {
      const novo = fn(structuredClone(atual));
      return novo;
    });
    setSujo(true);
  };

  const salvar = () => {
    setServicos(s);
    setSujo(false);
    addToast?.('Página de pesquisa salva. Lembre de publicar.', 'success');
    addLogEntry?.('Pesquisa', 'textos e peças salvos');
  };

  return (
    <div className="max-w-4xl">
      <div className="sticky top-[57px] z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 mb-4 bg-[rgb(var(--fundo-rgb)/0.95)] flex items-center justify-between gap-3">
        <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">
          A página <b>/servicos</b> e o bloco da home. {sujo && <span className="text-[rgb(var(--rubedo-rgb))]">Há alterações não salvas.</span>}
        </p>
        <button onClick={salvar} className={BTN} disabled={!sujo}>Salvar</button>
      </div>

      <Secao titulo="Abertura">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Rótulo"><Texto value={s.hero.eyebrow} onChange={(v) => muda((x) => ((x.hero.eyebrow = v), x))} /></Campo>
          <Campo label="Texto do botão"><Texto value={s.hero.primaryLabel} onChange={(v) => muda((x) => ((x.hero.primaryLabel = v), x))} /></Campo>
          <Campo label="Título (começo)"><Texto value={s.hero.title} onChange={(v) => muda((x) => ((x.hero.title = v), x))} /></Campo>
          <Campo label="Título (palavra em vermelho)"><Texto value={s.hero.emphasis} onChange={(v) => muda((x) => ((x.hero.emphasis = v), x))} /></Campo>
          <Campo label="Texto de abertura" className="sm:col-span-2"><Area value={s.hero.lead} onChange={(v) => muda((x) => ((x.hero.lead = v), x))} rows={3} /></Campo>
        </div>
      </Secao>

      <Secao
        titulo="As peças"
        descricao="O que se vende, com escopo fechado. «Destaque» põe a peça com a borda vermelha; «oculta» tira do site sem apagar."
        acoes={
          <button
            className={BTN2}
            onClick={() => muda((x) => (x.pecas.push({ id: novoId('peca'), nome: 'Nova peça', pergunta: '', descricao: '', entrega: '', prazo: '', preco: 'sob orçamento', icone: 'lupa', destaque: false, oculto: false }), x))}
          >
            + peça
          </button>
        }
      >
        <div className="space-y-4">
          {s.pecas.map((p, i) => (
            <div key={p.id} className={CARD}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="flex items-center gap-2 font-serif text-[1.15rem] text-[rgb(var(--texto-forte-rgb))]">
                  <Icone nome={p.icone} size={20} /> {p.nome || 'Sem nome'}
                </p>
                <div className="flex gap-1.5">
                  <button className={BTN2} onClick={() => muda((x) => ((x.pecas = mover(x.pecas, i, -1)), x))} aria-label="Subir">↑</button>
                  <button className={BTN2} onClick={() => muda((x) => ((x.pecas = mover(x.pecas, i, 1)), x))} aria-label="Descer">↓</button>
                  <button className={BTN_PERIGO} onClick={() => confirm(`Apagar «${p.nome}»?`) && muda((x) => (x.pecas.splice(i, 1), x))}>Apagar</button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Campo label="Nome"><Texto value={p.nome} onChange={(v) => muda((x) => ((x.pecas[i].nome = v), x))} /></Campo>
                <Campo label="A pergunta do cliente"><Texto value={p.pergunta} onChange={(v) => muda((x) => ((x.pecas[i].pergunta = v), x))} placeholder="Onde Jung fala disso?" /></Campo>
                <Campo label="Descrição" className="sm:col-span-2"><Area value={p.descricao} onChange={(v) => muda((x) => ((x.pecas[i].descricao = v), x))} /></Campo>
                <Campo label="Entrega"><Texto value={p.entrega} onChange={(v) => muda((x) => ((x.pecas[i].entrega = v), x))} placeholder="Dossiê em PDF" /></Campo>
                <Campo label="Prazo"><Texto value={p.prazo} onChange={(v) => muda((x) => ((x.pecas[i].prazo = v), x))} placeholder="a combinar" /></Campo>
                <Campo label="Preço" dica="Texto livre: «a partir de R$ 150», «sob orçamento»."><Texto value={p.preco} onChange={(v) => muda((x) => ((x.pecas[i].preco = v), x))} /></Campo>
                <Campo label="Ícone"><Escolha value={p.icone} onChange={(v) => muda((x) => ((x.pecas[i].icone = v), x))} opcoes={OPCOES_ICONE} /></Campo>
                <div className="flex gap-6 sm:col-span-2 pt-1">
                  <Chave ligado={p.destaque} onChange={(v) => muda((x) => ((x.pecas[i].destaque = v), x))} label="Destaque" />
                  <Chave ligado={p.oculto} onChange={(v) => muda((x) => ((x.pecas[i].oculto = v), x))} label="Oculta" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao
        titulo="Como funciona (passos)"
        acoes={<button className={BTN2} onClick={() => muda((x) => (x.passos.push({ titulo: 'Novo passo', texto: '' }), x))}>+ passo</button>}
      >
        <div className="space-y-3">
          {s.passos.map((p, i) => (
            <div key={i} className={`${CARD} grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-start`}>
              <Texto value={p.titulo} onChange={(v) => muda((x) => ((x.passos[i].titulo = v), x))} />
              <Area value={p.texto} onChange={(v) => muda((x) => ((x.passos[i].texto = v), x))} rows={2} />
              <div className="flex gap-1.5">
                <button className={BTN2} onClick={() => muda((x) => ((x.passos = mover(x.passos, i, -1)), x))}>↑</button>
                <button className={BTN_PERIGO} onClick={() => muda((x) => (x.passos.splice(i, 1), x))}>×</button>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao
        titulo="Limites (o que não se faz)"
        descricao="Aparece na página para deixar claro o escopo: sem ghostwriting, sem interpretação de caso, uso de IA declarado."
        acoes={<button className={BTN2} onClick={() => muda((x) => (x.limites.push(''), x))}>+ limite</button>}
      >
        <div className="space-y-2">
          {s.limites.map((l, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Area value={l} onChange={(v) => muda((x) => ((x.limites[i] = v), x))} rows={2} />
              <button className={BTN_PERIGO} onClick={() => muda((x) => (x.limites.splice(i, 1), x))}>×</button>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Chamada final">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Título"><Texto value={s.cta.titulo} onChange={(v) => muda((x) => ((x.cta.titulo = v), x))} /></Campo>
          <Campo label="E-mail para pedidos (opcional)"><Texto value={s.cta.email} onChange={(v) => muda((x) => ((x.cta.email = v), x))} placeholder="voce@exemplo.com" /></Campo>
          <Campo label="Texto" className="sm:col-span-2"><Area value={s.cta.texto} onChange={(v) => muda((x) => ((x.cta.texto = v), x))} rows={2} /></Campo>
          <Campo label="Mensagem que abre no WhatsApp" className="sm:col-span-2" dica="O número vem de Configurações.">
            <Area value={s.cta.whatsappMensagem} onChange={(v) => muda((x) => ((x.cta.whatsappMensagem = v), x))} rows={2} />
          </Campo>
        </div>
      </Secao>
    </div>
  );
}

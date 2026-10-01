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
    addLogEntry?.('Pesquisa', 'textos e níveis salvos');
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

      <Secao titulo="O serviço" descricao="O bloco que explica a pesquisa: o que é, os exemplos de tema e o quadro «Já tem um texto?».">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <Campo label="Rótulo"><Texto value={s.servico.rotulo} onChange={(v) => muda((x) => ((x.servico.rotulo = v), x))} /></Campo>
          <div />
          <Campo label="Título (começo)"><Texto value={s.servico.titulo} onChange={(v) => muda((x) => ((x.servico.titulo = v), x))} /></Campo>
          <Campo label="Título (parte em itálico)"><Texto value={s.servico.pivo} onChange={(v) => muda((x) => ((x.servico.pivo = v), x))} /></Campo>
          <Campo label="Texto" className="sm:col-span-2"><Area value={s.servico.texto} onChange={(v) => muda((x) => ((x.servico.texto = v), x))} rows={3} /></Campo>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-[11px] uppercase tracking-[0.14em] font-semibold text-[rgb(var(--texto-dim-rgb))] font-sans">Exemplos de tema («O tema pode ser»)</span>
              <button className={BTN2} onClick={() => muda((x) => (x.servico.temas.push({ titulo: 'Novo exemplo', exemplo: '' }), x))}>+ exemplo</button>
            </div>
            <div className="space-y-2">
              {(s.servico.temas || []).map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                  <Texto value={t.titulo} onChange={(v) => muda((x) => ((x.servico.temas[i].titulo = v), x))} placeholder="Um conceito" />
                  <Texto value={t.exemplo} onChange={(v) => muda((x) => ((x.servico.temas[i].exemplo = v), x))} placeholder="sombra, anima, sincronicidade" />
                  <button className={BTN_PERIGO} onClick={() => muda((x) => (x.servico.temas.splice(i, 1), x))}>×</button>
                </div>
              ))}
            </div>
          </div>
          <Campo label="Quadro: título"><Texto value={s.servico.textoProprioTitulo} onChange={(v) => muda((x) => ((x.servico.textoProprioTitulo = v), x))} /></Campo>
          <div />
          <Campo label="Quadro: texto (vazio = sem quadro)" className="sm:col-span-2"><Area value={s.servico.textoProprio} onChange={(v) => muda((x) => ((x.servico.textoProprio = v), x))} rows={3} /></Campo>
        </div>
      </Secao>

      <Secao
        titulo="Níveis de entrega"
        descricao="Do mais simples ao mais completo; cada um soma ao anterior. «Destaque» pinta o nível de verde-escuro; «oculto» tira do site sem apagar."
        acoes={
          <button
            className={BTN2}
            onClick={() => muda((x) => (x.pecas.push({ id: novoId('nivel'), nome: 'Novo nível', pergunta: '', descricao: '', entrega: '', prazo: 'a combinar', preco: 'sob orçamento', icone: 'lupa', destaque: false, oculto: false }), x))}
          >
            + nível
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
                <Campo label="Para quem"><Texto value={p.pergunta} onChange={(v) => muda((x) => ((x.pecas[i].pergunta = v), x))} placeholder="Para mestrado e artigo de revista" /></Campo>
                <Campo label="Descrição" className="sm:col-span-2"><Area value={p.descricao} onChange={(v) => muda((x) => ((x.pecas[i].descricao = v), x))} /></Campo>
                <Campo label="Entrega"><Texto value={p.entrega} onChange={(v) => muda((x) => ((x.pecas[i].entrega = v), x))} placeholder="PDF com o mapa e o roteiro" /></Campo>
                <Campo label="Prazo"><Texto value={p.prazo} onChange={(v) => muda((x) => ((x.pecas[i].prazo = v), x))} placeholder="a combinar" /></Campo>
                <Campo label="Preço" dica="Texto livre: «a partir de R$ 150», «sob orçamento»."><Texto value={p.preco} onChange={(v) => muda((x) => ((x.pecas[i].preco = v), x))} /></Campo>
                <Campo label="Ícone"><Escolha value={p.icone} onChange={(v) => muda((x) => ((x.pecas[i].icone = v), x))} opcoes={OPCOES_ICONE} /></Campo>
                <div className="flex gap-6 sm:col-span-2 pt-1">
                  <Chave ligado={p.destaque} onChange={(v) => muda((x) => ((x.pecas[i].destaque = v), x))} label="Destaque" />
                  <Chave ligado={p.oculto} onChange={(v) => muda((x) => ((x.pecas[i].oculto = v), x))} label="Oculto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Roteiros sobre Jung" descricao="O bloco escuro para quem faz conteúdo. Desligado, some da página.">
        <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
          <div className="sm:col-span-2"><Chave ligado={s.roteiros.ativo} onChange={(v) => muda((x) => ((x.roteiros.ativo = v), x))} label="Mostrar os roteiros na página" /></div>
          <Campo label="Rótulo"><Texto value={s.roteiros.rotulo} onChange={(v) => muda((x) => ((x.roteiros.rotulo = v), x))} /></Campo>
          <Campo label="Preço" dica="Texto livre: «sob orçamento», «a partir de R$ 120»."><Texto value={s.roteiros.preco} onChange={(v) => muda((x) => ((x.roteiros.preco = v), x))} /></Campo>
          <Campo label="Título (começo)"><Texto value={s.roteiros.titulo} onChange={(v) => muda((x) => ((x.roteiros.titulo = v), x))} /></Campo>
          <Campo label="Título (parte em itálico)"><Texto value={s.roteiros.pivo} onChange={(v) => muda((x) => ((x.roteiros.pivo = v), x))} /></Campo>
          <Campo label="Texto" className="sm:col-span-2"><Area value={s.roteiros.texto} onChange={(v) => muda((x) => ((x.roteiros.texto = v), x))} rows={3} /></Campo>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-[11px] uppercase tracking-[0.14em] font-semibold text-[rgb(var(--texto-dim-rgb))] font-sans">Formatos</span>
              <button className={BTN2} onClick={() => muda((x) => (x.roteiros.formatos.push('Novo formato'), x))}>+ formato</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {(s.roteiros.formatos || []).map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Texto value={f} onChange={(v) => muda((x) => ((x.roteiros.formatos[i] = v), x))} />
                  <button className={BTN_PERIGO} onClick={() => muda((x) => (x.roteiros.formatos.splice(i, 1), x))}>×</button>
                </div>
              ))}
            </div>
          </div>
          <Campo label="Texto do botão"><Texto value={s.roteiros.botao} onChange={(v) => muda((x) => ((x.roteiros.botao = v), x))} /></Campo>
          <Campo label="Mensagem que abre no WhatsApp"><Texto value={s.roteiros.whatsappMensagem} onChange={(v) => muda((x) => ((x.roteiros.whatsappMensagem = v), x))} /></Campo>
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

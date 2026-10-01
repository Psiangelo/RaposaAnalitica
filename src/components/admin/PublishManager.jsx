'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { markPublished } from '@/lib/unpublishedChanges';
import {
  publicar, verificarToken, lerToken, salvarToken, montarConteudo, ultimoDeploy, CHAVES_PUBLICAVEIS,
} from '@/lib/githubPublish';
import { GITHUB_REPO } from '@/lib/site';
import { CARD, INPUT, LABEL, BTN, BTN2 } from '@/components/admin/ui';

function quando(iso) {
  if (!iso) return '';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} dia(s)`;
}

/**
 * Publicar: grava o conteúdo no repositório e o site se reconstrói sozinho.
 * Primeira vez: colar um token do GitHub (fica só neste navegador).
 */
export default function PublishManager({ addToast, addLogEntry }) {
  const [token, setToken] = useState('');
  const [rascunhoToken, setRascunhoToken] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [tokenOk, setTokenOk] = useState(null);
  const [nota, setNota] = useState('');
  const [etapa, setEtapa] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [deploy, setDeploy] = useState(null);

  useEffect(() => {
    const t = lerToken();
    setToken(t);
    if (t) verificarToken(t).then((r) => setTokenOk(r.ok)).catch(() => setTokenOk(false));
  }, []);

  useEffect(() => {
    if (!token) return;
    let vivo = true;
    const olhar = () => ultimoDeploy(token).then((d) => vivo && setDeploy(d));
    olhar();
    const id = setInterval(olhar, 15000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [token, resultado]);

  const conteudo = useMemo(() => (typeof window === 'undefined' ? {} : montarConteudo()), [resultado]);
  const tamanhoKb = (new Blob([JSON.stringify(conteudo)]).size / 1024).toFixed(0);

  const guardarToken = async () => {
    const t = rascunhoToken.trim();
    if (!t) return;
    setVerificando(true);
    try {
      const r = await verificarToken(t);
      if (!r.ok) {
        addToast?.('Esse token não tem permissão de escrita no repositório.', 'error');
        setTokenOk(false);
      } else {
        salvarToken(t);
        setToken(t);
        setTokenOk(true);
        setRascunhoToken('');
        addToast?.('Token guardado neste navegador.', 'success');
      }
    } catch (e) {
      addToast?.(`O GitHub recusou o token (${e.message}).`, 'error');
      setTokenOk(false);
    } finally {
      setVerificando(false);
    }
  };

  const esquecerToken = () => {
    salvarToken('');
    setToken('');
    setTokenOk(null);
  };

  const fazerPublicacao = async () => {
    setPublicando(true);
    setResultado(null);
    try {
      const r = await publicar({ token, nota, progresso: setEtapa });
      markPublished();
      setResultado(r);
      setNota('');
      addToast?.('Publicado. O site se atualiza em uns 2 minutos.', 'success');
      addLogEntry?.('Publicado no GitHub', `${r.imagens} imagem(ns) nova(s)`);
    } catch (e) {
      addToast?.(`Não deu para publicar: ${e.message}`, 'error');
    } finally {
      setPublicando(false);
      setEtapa('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
      <p className="font-sans text-[15px] text-[rgb(var(--texto-rgb))] leading-relaxed mb-6">
        O painel guarda o que você edita neste navegador. <b>Publicar</b> grava tudo no repositório{' '}
        <code className="px-1.5 py-0.5 rounded bg-[rgb(var(--fundo-2-rgb))] text-[13px]">{GITHUB_REPO}</code> num commit, e o site se
        reconstrói sozinho (uns 2 minutos). Ensaios, verbetes e trilhas novos ganham página própria no mesmo passo.
      </p>

      {!token ? (
        <div className={`${CARD} mb-6`}>
          <h3 className="font-serif text-[1.25rem] font-semibold text-[rgb(var(--texto-forte-rgb))] mb-2">Primeira vez: o token do GitHub</h3>
          <ol className="list-decimal pl-5 space-y-1.5 font-sans text-[14px] text-[rgb(var(--texto-rgb))] mb-4">
            <li>
              Entre no GitHub com a conta <b>Psiangelo</b> e abra{' '}
              <a className="underline text-[rgb(var(--acento-rgb))]" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">
                Settings → Developer settings → Fine-grained tokens → Generate new token
              </a>.
            </li>
            <li>Nome: «painel da Raposa». Validade: a que quiser (1 ano é bom).</li>
            <li>Repository access: <b>Only select repositories</b> → <b>{GITHUB_REPO.split('/')[1]}</b>.</li>
            <li>Permissions → Repository permissions: <b>Contents: Read and write</b> (e, se quiser ver o andamento do deploy aqui, <b>Actions: Read</b>).</li>
            <li>Gere, copie e cole abaixo. Ele fica só neste navegador e nunca vai para o site.</li>
          </ol>
          <label className={LABEL}>Token</label>
          <div className="flex gap-2">
            <input type="password" value={rascunhoToken} onChange={(e) => setRascunhoToken(e.target.value)} placeholder="github_pat_…" className={INPUT} />
            <button onClick={guardarToken} disabled={verificando || !rascunhoToken.trim()} className={BTN}>
              {verificando ? 'Conferindo…' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : (
        <div className={`${CARD} mb-6 flex flex-wrap items-center justify-between gap-3`}>
          <div className="font-sans text-[14px]">
            <p className="text-[rgb(var(--texto-dim-rgb))] text-[11px] uppercase tracking-[0.14em] font-semibold">Token do GitHub</p>
            <p className={tokenOk === false ? 'text-[rgb(var(--rubedo-rgb))]' : 'text-[rgb(var(--texto-forte-rgb))]'}>
              {tokenOk === null ? 'conferindo…' : tokenOk ? 'guardado e com permissão de escrita' : 'sem permissão ou vencido: troque'}
            </p>
          </div>
          <button onClick={esquecerToken} className={BTN2}>Trocar token</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className={CARD}>
          <p className={LABEL}>O que vai</p>
          <p className="font-serif text-2xl text-[rgb(var(--texto-forte-rgb))]">{Object.keys(conteudo).length} <span className="text-sm font-sans text-[rgb(var(--texto-dim-rgb))]">de {CHAVES_PUBLICAVEIS.length} partes</span></p>
        </div>
        <div className={CARD}>
          <p className={LABEL}>Tamanho</p>
          <p className="font-serif text-2xl text-[rgb(var(--texto-forte-rgb))]">{tamanhoKb} <span className="text-sm font-sans text-[rgb(var(--texto-dim-rgb))]">KB</span></p>
        </div>
        <div className={`${CARD} col-span-2 sm:col-span-1`}>
          <p className={LABEL}>Último deploy</p>
          {deploy ? (
            <a href={deploy.url} target="_blank" rel="noopener noreferrer" className="font-sans text-[14px] text-[rgb(var(--texto-forte-rgb))] underline-offset-2 hover:underline">
              {deploy.status !== 'completed' ? 'reconstruindo…' : deploy.conclusao === 'success' ? 'no ar' : `falhou (${deploy.conclusao})`} · {quando(deploy.quando)}
            </a>
          ) : (
            <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">{token ? 'sem acesso (opcional)' : '—'}</p>
          )}
        </div>
      </div>

      <label className={LABEL}>Nota (opcional, vai no commit)</label>
      <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="ex.: ensaio novo sobre a sombra" className={`${INPUT} mb-3`} />
      <button
        onClick={fazerPublicacao}
        disabled={!token || tokenOk === false || publicando}
        className="w-full rounded-2xl bg-[var(--mata)] hover:bg-[var(--cedro)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--washi)] font-sans font-semibold text-[16px] px-5 py-4 transition-colors"
      >
        {publicando ? `${etapa || 'Publicando'}…` : 'Publicar agora'}
      </button>
      {resultado && (
        <p className="mt-3 font-sans text-[14px] text-[rgb(var(--texto-rgb))]">
          Feito.{' '}
          <a href={resultado.commitUrl} target="_blank" rel="noopener noreferrer" className="underline text-[rgb(var(--acento-rgb))]">Ver o commit</a>. O site
          atualiza quando o deploy terminar.
        </p>
      )}

      <details className={`${CARD} mt-8`}>
        <summary className="cursor-pointer font-sans text-[14px] text-[rgb(var(--texto-rgb))]">Ver o conteúdo que será publicado</summary>
        <pre className="mt-3 max-h-96 overflow-auto text-[11px] font-mono text-[rgb(var(--texto-rgb))] bg-[rgb(var(--fundo-rgb))] p-3 rounded-lg">
          {JSON.stringify(conteudo, (k, v) => (typeof v === 'string' && v.length > 300 ? `${v.slice(0, 300)}… (${v.length} caracteres)` : v), 2)}
        </pre>
      </details>
    </motion.div>
  );
}

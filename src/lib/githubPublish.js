'use client';

/**
 * githubPublish — publicar = gravar o conteúdo no repositório do GitHub.
 *
 * A Raposa não tem banco. O painel junta o conteúdo editado neste navegador,
 * grava src/data/site-content.json (e as imagens novas em public/uploads/)
 * num commit só, pela API do GitHub, com o token pessoal do dono. O push
 * dispara o GitHub Actions, que reconstrói o site estático com o conteúdo
 * novo: posts, verbetes e trilhas novos ganham página própria, sem passo
 * manual (o problema do Psiangelo, onde publicar não reconstruía).
 *
 * ⚠️ Só vão as chaves da LISTA de conteúdo (SITEDATA_KEYS). Nada de sessão,
 * senha, token ou registro de atividade: o Psiangelo publicava tudo que
 * começava com o prefixo e assim vazou a sessão do Supabase.
 *
 * O token fica só neste navegador (localStorage), fora do prefixo
 * publicável. Permissão necessária: Contents (read and write) no repositório.
 */

import { SITEDATA_KEYS } from '@/lib/sitedata';
import { GITHUB_REPO } from '@/lib/site';
import snapshotDoBuild from '@/data/site-content.json';

export const TOKEN_KEY = 'raposa_github_token';
const UPLOADS_KEY = 'raposa_uploads_publicados';
const ARQUIVO = 'src/data/site-content.json';
const API = 'https://api.github.com';

export const CHAVES_PUBLICAVEIS = Array.from(new Set(Object.values(SITEDATA_KEYS)));

export function lerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function salvarToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t.trim());
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

/** O conteúdo a publicar: o deste navegador, com o do build de reserva. */
export function montarConteudo() {
  const data = {};
  const doBuild = snapshotDoBuild?.data || {};
  for (const k of CHAVES_PUBLICAVEIS) {
    let valor;
    try {
      const raw = localStorage.getItem(k);
      if (raw != null) valor = JSON.parse(raw);
    } catch {
      valor = undefined;
    }
    if (valor === undefined && Object.prototype.hasOwnProperty.call(doBuild, k)) valor = doBuild[k];
    if (valor !== undefined) data[k] = valor;
  }
  return data;
}

async function gh(token, caminho, opts = {}) {
  const res = await fetch(`${API}${caminho}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const j = await res.json();
      msg = `${res.status} ${j.message || ''}`.trim();
    } catch {
      /* noop */
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

/** Confere o token: o repositório existe e ele pode escrever? */
export async function verificarToken(token) {
  const repo = await gh(token, `/repos/${GITHUB_REPO}`);
  return { ok: !!repo?.permissions?.push, repo };
}

function base64DeTexto(texto) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

async function sha1(texto) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/**
 * Troca cada imagem embutida (data:image/...;base64) por um arquivo em
 * public/uploads/. Devolve os arquivos novos a enviar.
 */
async function extrairImagens(data) {
  let mapa = {};
  try {
    mapa = JSON.parse(localStorage.getItem(UPLOADS_KEY) || '{}');
  } catch {
    mapa = {};
  }
  const novos = [];
  const visitar = async (v) => {
    if (typeof v === 'string') {
      if (!v.includes('data:image/')) return v;
      const re = /data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,([A-Za-z0-9+/=]+)/g;
      let out = v;
      const achados = [...v.matchAll(re)];
      for (const m of achados) {
        const [inteiro, tipo, b64] = m;
        const h = await sha1(b64);
        const ext = tipo === 'jpeg' ? 'jpg' : tipo === 'svg+xml' ? 'svg' : tipo;
        const caminho = `/uploads/${h}.${ext}`;
        if (!mapa[h]) novos.push({ path: `public${caminho}`, b64, hash: h });
        out = out.split(inteiro).join(caminho);
      }
      return out;
    }
    if (Array.isArray(v)) return Promise.all(v.map(visitar));
    if (v && typeof v === 'object') {
      const o = {};
      for (const [k, x] of Object.entries(v)) o[k] = await visitar(x);
      return o;
    }
    return v;
  };
  const limpo = await visitar(data);
  return { limpo, novos, mapa };
}

/**
 * Publica. Devolve { commitUrl, versao }.
 * @param {(etapa: string) => void} progresso
 */
export async function publicar({ token, nota = '', progresso = () => {} }) {
  if (!token) throw new Error('Falta o token do GitHub (aba Publicar).');
  progresso('Juntando o conteúdo');
  const dados = montarConteudo();
  const { limpo, novos, mapa } = await extrairImagens(dados);

  const versao = Date.now();
  const snapshot = {
    version: versao,
    published_at: new Date().toISOString(),
    note: nota || 'Publicado pelo painel',
    data: limpo,
  };

  progresso('Lendo o repositório');
  const ref = await gh(token, `/repos/${GITHUB_REPO}/git/ref/heads/main`);
  const commitBase = await gh(token, `/repos/${GITHUB_REPO}/git/commits/${ref.object.sha}`);

  const arvore = [];
  for (const [i, f] of novos.entries()) {
    progresso(`Enviando imagem ${i + 1} de ${novos.length}`);
    const blob = await gh(token, `/repos/${GITHUB_REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: f.b64, encoding: 'base64' }),
    });
    arvore.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  progresso('Enviando o conteúdo');
  const blobJson = await gh(token, `/repos/${GITHUB_REPO}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: base64DeTexto(JSON.stringify(snapshot, null, 2) + '\n'), encoding: 'base64' }),
  });
  arvore.push({ path: ARQUIVO, mode: '100644', type: 'blob', sha: blobJson.sha });

  const tree = await gh(token, `/repos/${GITHUB_REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: commitBase.tree.sha, tree: arvore }),
  });
  progresso('Criando o commit');
  const commit = await gh(token, `/repos/${GITHUB_REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: `Publica pelo painel${nota ? `: ${nota}` : ''}`,
      tree: tree.sha,
      parents: [ref.object.sha],
    }),
  });
  await gh(token, `/repos/${GITHUB_REPO}/git/refs/heads/main`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });

  for (const f of novos) mapa[f.hash] = f.path;
  try {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(mapa));
  } catch {
    /* noop */
  }
  return { commitUrl: commit.html_url, versao, imagens: novos.length };
}

/** Situação do último deploy (precisa de permissão Actions: read; opcional). */
export async function ultimoDeploy(token) {
  try {
    const r = await gh(token, `/repos/${GITHUB_REPO}/actions/runs?per_page=1&branch=main`);
    const run = r?.workflow_runs?.[0];
    if (!run) return null;
    return { status: run.status, conclusao: run.conclusion, quando: run.created_at, url: run.html_url };
  } catch {
    return null;
  }
}

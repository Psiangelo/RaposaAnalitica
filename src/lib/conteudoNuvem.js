'use client';

/**
 * conteudoNuvem — o conteúdo do site no banco da Raposa.
 *
 * A tabela `conteudo` tem uma linha por chave do painel (raposa_admin_*),
 * com a data da última mudança. Qualquer visitante pode ler.
 *
 * Este módulo é o lado leve, que roda para todo visitante: só fetch, sem o
 * cliente completo da Supabase. Ele guarda neste navegador, por chave, a
 * data da versão que tem (`raposa_nuvem_versoes`) e a impressão digital do
 * que veio do banco (`raposa_nuvem_enviados`), para:
 *   - baixar só o que mudou depois do build (o site mostra a mudança na
 *     hora, antes de o GitHub reconstruir as páginas);
 *   - o painel publicar só as chaves que foram editadas aqui.
 */
import { SITEDATA_KEYS } from '@/lib/sitedata';
import { SUPABASE_URL, SUPABASE_CHAVE } from '@/lib/supabaseConfig';

export const CHAVES_PUBLICAVEIS = Array.from(new Set(Object.values(SITEDATA_KEYS)));

const VERSOES_KEY = 'raposa_nuvem_versoes';
const ENVIADOS_KEY = 'raposa_nuvem_enviados';

function lerMapa(k) {
  try {
    return JSON.parse(localStorage.getItem(k) || '{}') || {};
  } catch {
    return {};
  }
}
function gravarMapa(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* quota cheia */
  }
}

export const lerVersoes = () => lerMapa(VERSOES_KEY);
export const lerEnviados = () => lerMapa(ENVIADOS_KEY);

/** Impressão digital rápida de um texto (djb2). */
export function digital(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return `${texto.length}:${(h >>> 0).toString(36)}`;
}

/**
 * Anota que este navegador recebeu estas chaves já publicadas (do build ou
 * do banco): a data de cada uma e a impressão digital do texto gravado.
 * @param {Record<string, string>} versoes chave → data ISO
 */
export function registrarRecebidas(versoes = {}) {
  const v = lerVersoes();
  const e = lerEnviados();
  for (const [chave, quando] of Object.entries(versoes)) {
    if (!CHAVES_PUBLICAVEIS.includes(chave)) continue;
    if (!v[chave] || new Date(quando) > new Date(v[chave])) v[chave] = quando;
    const raw = localStorage.getItem(chave);
    if (raw != null) e[chave] = digital(raw);
  }
  gravarMapa(VERSOES_KEY, v);
  gravarMapa(ENVIADOS_KEY, e);
}

/** Depois de publicar: as chaves enviadas e a data que o banco deu a cada uma. */
export function registrarPublicadas(linhas = []) {
  const v = lerVersoes();
  const e = lerEnviados();
  for (const l of linhas) {
    v[l.chave] = l.atualizado_em;
    const raw = localStorage.getItem(l.chave);
    if (raw != null) e[l.chave] = digital(raw);
  }
  gravarMapa(VERSOES_KEY, v);
  gravarMapa(ENVIADOS_KEY, e);
}

/**
 * Esta chave foi editada aqui depois da última versão recebida ou enviada?
 * (Só vale para chaves já registradas: visitante nunca edita, então para
 * ele é sempre falso.)
 */
export function editadaAqui(chave, enviados = lerEnviados()) {
  const raw = localStorage.getItem(chave);
  return enviados[chave] != null && raw != null && enviados[chave] !== digital(raw);
}

/** As chaves editadas neste navegador e ainda não enviadas ao banco. */
export function chavesEditadas() {
  const e = lerEnviados();
  const out = [];
  for (const k of CHAVES_PUBLICAVEIS) {
    const raw = localStorage.getItem(k);
    if (raw == null) continue;
    if (e[k] !== digital(raw)) out.push(k);
  }
  return out;
}

/**
 * Baixa do banco o que é mais novo que o deste navegador. Leve: primeiro só
 * as datas; depois só as chaves que mudaram. Uma chave editada aqui e ainda
 * não publicada não é trocada (o rascunho do painel vale mais); ela vai para
 * `aoPreservar`, para o painel avisar.
 * @param {{ aoPreservar?: (chaves: string[]) => void }} [opcoes]
 * @returns {Promise<string[]>} as chaves atualizadas
 */
export async function baixarNovidades({ aoPreservar } = {}) {
  if (typeof window === 'undefined') return [];
  const base = `${SUPABASE_URL}/rest/v1/conteudo`;
  const headers = { apikey: SUPABASE_CHAVE };
  const r = await fetch(`${base}?select=chave,atualizado_em`, { headers, cache: 'no-store' });
  if (!r.ok) return [];
  const lista = await r.json();
  const locais = lerVersoes();
  const enviados = lerEnviados();
  const novas = lista
    .filter((l) => CHAVES_PUBLICAVEIS.includes(l.chave))
    .filter((l) => !locais[l.chave] || new Date(l.atualizado_em) > new Date(locais[l.chave]))
    .map((l) => l.chave);
  const preservadas = novas.filter((k) => editadaAqui(k, enviados));
  if (preservadas.length) aoPreservar?.(preservadas);
  const mudaram = novas.filter((k) => !preservadas.includes(k));
  if (!mudaram.length) return [];
  const r2 = await fetch(`${base}?select=chave,valor,atualizado_em&chave=in.(${mudaram.join(',')})`, { headers, cache: 'no-store' });
  if (!r2.ok) return [];
  const linhas = await r2.json();
  const versoes = {};
  for (const l of linhas) {
    try {
      localStorage.setItem(l.chave, JSON.stringify(l.valor));
      versoes[l.chave] = l.atualizado_em;
    } catch {
      /* quota cheia: pula */
    }
  }
  registrarRecebidas(versoes);
  try {
    window.dispatchEvent(new CustomEvent('sitedata:bootstrap', { detail: { nuvem: Object.keys(versoes) } }));
  } catch {
    /* noop */
  }
  return Object.keys(versoes);
}

/** Nome de cada parte do conteúdo, para mostrar no painel. */
export const NOMES = {
  raposa_admin_blog: 'Ensaios',
  raposa_admin_blog_series: 'Séries de ensaios',
  raposa_admin_glossario: 'Verbetes',
  raposa_admin_glossario_categories: 'Categorias dos verbetes',
  raposa_admin_glossario_page: 'Página dos verbetes',
  raposa_admin_trilhas: 'Trilhas',
  raposa_admin_estudos_page: 'Página das trilhas',
  raposa_admin_areas: 'Áreas das trilhas',
  raposa_admin_cartographies: 'Cartografia',
  raposa_admin_homepage: 'Textos da home',
  raposa_admin_home_sections: 'Ordem da home',
  raposa_admin_home_sections_layout: 'Ordem da home',
  raposa_admin_bio: 'Bio e autor',
  raposa_admin_visibility: 'O que aparece',
  raposa_admin_settings: 'Configurações',
  raposa_admin_labels: 'Nomes do menu',
  raposa_admin_servicos: 'Pesquisa',
  raposa_admin_loja: 'Loja',
  raposa_admin_newsletter: 'Cartas',
  raposa_admin_tag_estilos: 'Estilo das tags',
};
export const nomeDa = (chave) => NOMES[chave] || chave.replace(/^raposa_admin_/, '').replace(/_/g, ' ');

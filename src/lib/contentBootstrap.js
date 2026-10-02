'use client';

/**
 * contentBootstrap — popula o localStorage do navegador com o conteúdo
 * publicado que veio no build (src/data/site-content.json).
 *
 * Duas camadas. Primeiro o snapshot do build (a cópia que o GitHub montou do
 * banco), aplicado só quando é mais novo que o último aplicado neste
 * navegador, e sem tocar nas chaves que o painel editou aqui e ainda não
 * publicou (o rascunho do admin não se perde). Depois o próprio
 * banco da Raposa: baixa só as chaves publicadas depois do build, e assim o
 * visitante vê a mudança na hora, antes de as páginas fixas se reconstruírem.
 */

import snapshotLocal from '@/data/site-content.json';
import { markSynced } from '@/lib/unpublishedChanges';
import { registrarRecebidas, baixarNovidades, editadaAqui, lerEnviados } from '@/lib/conteudoNuvem';

const VERSION_KEY = 'raposa_admin_content_version';

function readLastApplied() {
  try {
    return Number(localStorage.getItem(VERSION_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function applySnapshot(snapshot, { force = false } = {}) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const version = Number(snapshot.version) || 0;
  if (version <= 0) return false;
  if (!force && version <= readLastApplied()) return false;

  const data = snapshot.data || {};
  const enviados = lerEnviados();
  const rascunhos = new Set(Object.keys(data).filter((k) => editadaAqui(k, enviados)));
  for (const key of Object.keys(data)) {
    if (rascunhos.has(key)) continue;
    try {
      localStorage.setItem(key, JSON.stringify(data[key]));
    } catch {
      /* quota cheia: pula essa chave */
    }
  }
  const versoes = Object.fromEntries(Object.entries(snapshot.versoes || {}).filter(([k]) => !rascunhos.has(k)));
  try { registrarRecebidas(versoes); } catch { /* noop */ }
  if (!rascunhos.size) {
    try { markSynced(snapshot.published_at || version); } catch { /* noop */ }
  }
  try { localStorage.setItem(VERSION_KEY, String(version)); } catch { /* noop */ }
  try { window.dispatchEvent(new CustomEvent('sitedata:bootstrap', { detail: { version } })); } catch { /* noop */ }
  return true;
}

export async function applyPublishedSnapshot() {
  if (typeof window === 'undefined') return;
  applySnapshot(snapshotLocal);
  try {
    await baixarNovidades();
  } catch {
    /* sem rede ou banco fora: fica o do build */
  }
}

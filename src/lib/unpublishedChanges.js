'use client';

/**
 * unpublishedChanges — rastreia se há mudanças locais ainda não publicadas
 * no Supabase. Banner global no admin usa isso pra lembrar o Gabriel de
 * clicar "Publicar" antes de ir pro celular.
 *
 * Estratégia: hash djb2 do snapshot atual (todas as chaves `raposa_admin_*`)
 * comparado com o hash do último snapshot publicado com sucesso.
 */

import { SITEDATA_KEYS } from '@/lib/sitedata';

// Só as chaves de conteúdo (as mesmas que a publicação leva).
const CHAVES = Array.from(new Set(Object.values(SITEDATA_KEYS)));

const HASH_KEY = 'raposa_admin_last_published_hash';
const PUBLISHED_AT_KEY = 'raposa_admin_last_published_at';

export function collectAdminSnapshot() {
  if (typeof window === 'undefined') return {};
  const out = {};
  for (const key of CHAVES) {
    const raw = localStorage.getItem(key);
    if (raw == null) continue;
    out[key] = raw;
  }
  return out;
}

// djb2 — rápido, colisão baixa pra conteúdo de admin
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export function computeSnapshotHash() {
  const snap = collectAdminSnapshot();
  const keys = Object.keys(snap).sort();
  if (keys.length === 0) return '0';
  const parts = keys.map((k) => `${k}:${snap[k].length}:${djb2(snap[k])}`);
  return djb2(parts.join('|'));
}

export function readLastPublishedHash() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(HASH_KEY);
  } catch {
    return null;
  }
}

export function readLastPublishedAt() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(PUBLISHED_AT_KEY);
  } catch {
    return null;
  }
}

export function markPublished() {
  if (typeof window === 'undefined') return;
  try {
    const hash = computeSnapshotHash();
    localStorage.setItem(HASH_KEY, hash);
    localStorage.setItem(PUBLISHED_AT_KEY, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('admin:published'));
  } catch {
    /* noop */
  }
}

/**
 * markSynced — carimba que o localStorage acabou de receber, sem edição
 * nenhuma por cima, um snapshot que JÁ está publicado (ou que já foi ao ar
 * no deploy).
 *
 * ⚠️ Por que isso existe: o carimbo de "última publicação" vive no
 * localStorage do navegador. Num navegador sem esse carimbo (limpo, outro
 * aparelho, aba anônima), `hasUnpublishedChanges` assumia que TODO o
 * conteúdo era mudança pendente, e o banner «Você tem mudanças não
 * publicadas» aparecia para sempre, dizendo «nunca publicado ainda» mesmo
 * havendo publicações. Um aviso que está sempre ligado não avisa nada, e o
 * Gabriel chegou a achar que o banner era inútil (30/07/2026).
 *
 * @param {string|number|null} publishedAt data da publicação de origem
 */
export function markSynced(publishedAt) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HASH_KEY, computeSnapshotHash());
    const iso = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
    localStorage.setItem(PUBLISHED_AT_KEY, iso);
    window.dispatchEvent(new CustomEvent('admin:published'));
  } catch {
    /* noop */
  }
}

export function hasUnpublishedChanges() {
  const current = computeSnapshotHash();
  const lastPublished = readLastPublishedHash();
  // Se nunca publicou, só consideramos dirty se há snapshot (current !== '0')
  if (!lastPublished) return current !== '0';
  return current !== lastPublished;
}

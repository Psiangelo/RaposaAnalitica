'use client';

/**
 * contentBootstrap — popula o localStorage do navegador com o conteúdo
 * publicado que veio no build (src/data/site-content.json).
 *
 * Na Raposa não há banco: publicar no painel grava o snapshot no repositório
 * do GitHub, e o GitHub Actions reconstrói o site. Então a única fonte é o
 * snapshot do bundle. Ele só é aplicado quando é mais novo do que o último
 * aplicado neste navegador, para não apagar o rascunho do admin a cada F5;
 * e quando é mais novo, ganha (outra máquina publicou depois).
 */

import snapshotLocal from '@/data/site-content.json';
import { markSynced } from '@/lib/unpublishedChanges';

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
  for (const key of Object.keys(data)) {
    try {
      localStorage.setItem(key, JSON.stringify(data[key]));
    } catch {
      /* quota cheia: pula essa chave */
    }
  }
  try { markSynced(snapshot.published_at || version); } catch { /* noop */ }
  try { localStorage.setItem(VERSION_KEY, String(version)); } catch { /* noop */ }
  try { window.dispatchEvent(new CustomEvent('sitedata:bootstrap', { detail: { version } })); } catch { /* noop */ }
  return true;
}

export async function applyPublishedSnapshot() {
  if (typeof window === 'undefined') return;
  applySnapshot(snapshotLocal);
}

'use client';

import { useEffect, useState } from 'react';
import {
  computeSnapshotHash,
  readLastPublishedHash,
  readLastPublishedAt,
} from '@/lib/unpublishedChanges';

/**
 * Hook que reflete o estado "há mudanças não publicadas?" reagindo a:
 *  - `sitedata:changed` (writeJson em sitedata.js, mesma aba)
 *  - `storage` (outras abas ou escritas fora do writeJson)
 *  - `admin:published` (após markPublished)
 *  - `sitedata:bootstrap` (após ContentBootstrap aplicar snapshot remoto)
 */
export function useUnpublishedChanges() {
  const [state, setState] = useState({
    ready: false,
    hasChanges: false,
    publishedAt: null,
  });

  useEffect(() => {
    const recompute = () => {
      const current = computeSnapshotHash();
      const lastHash = readLastPublishedHash();
      const publishedAt = readLastPublishedAt();
      const hasChanges = !lastHash ? current !== '0' : current !== lastHash;
      setState({ ready: true, hasChanges, publishedAt });
    };

    recompute();

    const onStorage = (e) => {
      if (!e.key || e.key.startsWith('raposa_admin_')) recompute();
    };
    const onChanged = () => recompute();

    window.addEventListener('storage', onStorage);
    window.addEventListener('sitedata:changed', onChanged);
    window.addEventListener('admin:published', onChanged);
    window.addEventListener('sitedata:bootstrap', onChanged);

    // Fallback: recompute periódico pra casos onde um manager grava
    // direto sem disparar evento.
    const interval = setInterval(recompute, 3000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sitedata:changed', onChanged);
      window.removeEventListener('admin:published', onChanged);
      window.removeEventListener('sitedata:bootstrap', onChanged);
      clearInterval(interval);
    };
  }, []);

  return state;
}

'use client';

import { useEffect } from 'react';
import { applyPublishedSnapshot } from '@/lib/contentBootstrap';

/**
 * ContentBootstrap — monta no layout raiz e aplica o snapshot publicado
 * (Supabase ou JSON local) no localStorage do visitante.
 *
 * Roda uma vez no mount do cliente. Não renderiza nada.
 */
export default function ContentBootstrap() {
  useEffect(() => {
    applyPublishedSnapshot();
  }, []);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_VISIBILITY, getSiteVisibility, SITEDATA_KEYS } from '@/lib/sitedata';

/**
 * useVisibility — hook que retorna o mapa de visibilidade do site.
 *
 * Começa com a visibilidade do snapshot publicado (getSiteVisibility(true),
 * modo seedOnly — puro, ignora localStorage) para bater byte-a-byte com o
 * HTML gerado no build; depois lê o localStorage de verdade no useEffect
 * (que pode trazer overrides do admin). `ready` indica se já leu.
 *
 * Acoplamento: se o snapshot marcar alguma chave como `false` (ex.: `home`),
 * a página correspondente já nasce como HiddenPlaceholder no HTML estático —
 * isso é esperado e reflete o que está publicado, não um bug deste hook.
 */
export function useVisibility() {
  const [visibility, setVisibility] = useState(() => {
    try {
      return getSiteVisibility(true);
    } catch {
      return DEFAULT_VISIBILITY;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVisibility(getSiteVisibility());
    setReady(true);

    const resync = () => setVisibility(getSiteVisibility());

    // storage event: admin editou em outra aba
    const onStorage = (e) => {
      if (e.key === SITEDATA_KEYS.visibility) resync();
    };
    // sitedata:changed: admin editou na mesma aba
    const onChanged = (e) => {
      if (!e.detail?.key || e.detail.key === SITEDATA_KEYS.visibility) resync();
    };
    // sitedata:bootstrap: ContentBootstrap populou localStorage
    window.addEventListener('storage', onStorage);
    window.addEventListener('sitedata:changed', onChanged);
    window.addEventListener('sitedata:bootstrap', resync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sitedata:changed', onChanged);
      window.removeEventListener('sitedata:bootstrap', resync);
    };
  }, []);

  return { visibility, ready };
}

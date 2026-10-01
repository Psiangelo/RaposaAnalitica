'use client';

import { useEffect, useState } from 'react';

/**
 * useSitedata — hook genérico que reage a mudanças no localStorage.
 *
 * - Valor inicial: `reader(true)` — modo "seedOnly", que os getters de
 *   src/lib/sitedata.js entendem como "ignore localStorage, devolva o
 *   snapshot publicado (src/data/site-content.json) normalizado". Isso é
 *   puro e determinístico: não depende de `window` nem de localStorage,
 *   então o valor é idêntico no HTML gerado em build e no primeiro render
 *   do cliente — sem isso, um visitante com localStorage já populado de
 *   uma sessão anterior veria um valor diferente do HTML estático e
 *   causaria hydration mismatch.
 * - Após mount: chama `reader()` (sem seedOnly) — aí sim considera
 *   localStorage, pegando overrides do admin/Supabase.
 * - Re-lê quando:
 *     • 'storage' event (admin editou em outra aba)
 *     • 'sitedata:changed' custom event (admin editou na mesma aba)
 *     • 'sitedata:bootstrap' custom event (ContentBootstrap populou localStorage)
 *
 * @param reader   (seedOnly?: boolean) => T — função que lê do localStorage
 *                 (ex: getHomepage). Se vier de fora de sitedata.js e não
 *                 aceitar o argumento, o argumento é ignorado sem erro.
 * @param initial  T — fallback só se `reader` lançar exceção
 * @param watchKey string | null — se definido, só reage quando essa chave mudar
 */
export function useSitedata(reader, initial, watchKey = null) {
  const [value, setValue] = useState(() => {
    try {
      return reader(true);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    setValue(reader());

    const resync = () => setValue(reader());

    const onStorage = (e) => {
      if (watchKey && e.key && e.key !== watchKey) return;
      resync();
    };
    const onChanged = (e) => {
      if (watchKey && e.detail?.key && e.detail.key !== watchKey) return;
      resync();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('sitedata:changed', onChanged);
    window.addEventListener('sitedata:bootstrap', resync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sitedata:changed', onChanged);
      window.removeEventListener('sitedata:bootstrap', resync);
    };
    // reader é estável em prática (funções top-level exportadas); watchKey raramente muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchKey]);

  return value;
}

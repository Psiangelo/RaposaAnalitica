'use client';

/**
 * O banco da Raposa (projeto Supabase «Kitsune projeto»).
 *
 * Só a chave PUBLICÁVEL vai no site: ela deixa o visitante ler o conteúdo e
 * se inscrever nas Cartas, e mais nada (as regras do banco cuidam disso; ver
 * supabase/*.sql). Escrever exige estar logado como administrador.
 *
 * A sessão do login fica em `raposa_sessao`, fora do prefixo raposa_admin_,
 * para nunca ser publicada junto com o conteúdo (foi assim que o Psiangelo
 * vazou a sessão dele).
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_CHAVE } from '@/lib/supabaseConfig';

export { SUPABASE_URL, SUPABASE_CHAVE, BALDE_IMAGENS } from '@/lib/supabaseConfig';

let cliente = null;

export function supabase() {
  if (!cliente) {
    cliente = createClient(SUPABASE_URL, SUPABASE_CHAVE, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'raposa_sessao', detectSessionInUrl: true },
    });
  }
  return cliente;
}

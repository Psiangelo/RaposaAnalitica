'use client';

/**
 * publicarNuvem — o botão Publicar do painel: grava no banco da Raposa as
 * chaves editadas neste navegador. Precisa do login de administrador (as
 * regras do banco recusam qualquer outro).
 *
 * Imagens coladas no painel (data:image/…;base64) sobem para o balde
 * público `imagens` e viram endereço de verdade antes de gravar; o
 * navegador também passa a guardar o endereço, não a imagem inteira.
 *
 * O site mostra a mudança na hora (o visitante baixa as novidades do
 * banco); as páginas fixas do GitHub se reconstroem sozinhas em alguns
 * minutos (.github/workflows/deploy.yml, que confere o banco de tempos em
 * tempos).
 */
import { supabase, SUPABASE_URL, BALDE_IMAGENS } from '@/lib/supabase';
import { chavesEditadas, registrarPublicadas } from '@/lib/conteudoNuvem';
import { markPublished } from '@/lib/unpublishedChanges';

async function sha1Curto(texto) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
}

function bytesDeBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Troca as imagens embutidas por endereços no balde `imagens`. */
async function subirImagens(valor, progresso) {
  const sb = supabase();
  const feitas = new Map();
  let enviadas = 0;
  const visitar = async (v) => {
    if (typeof v === 'string') {
      if (!v.includes('data:image/')) return v;
      const re = /data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,([A-Za-z0-9+/=]+)/g;
      let out = v;
      for (const m of [...v.matchAll(re)]) {
        const [inteiro, tipo, b64] = m;
        if (!feitas.has(inteiro)) {
          const ext = tipo === 'jpeg' ? 'jpg' : tipo === 'svg+xml' ? 'svg' : tipo;
          const nome = `${await sha1Curto(b64)}.${ext}`;
          progresso?.(`Enviando imagem ${enviadas + 1}`);
          const { error } = await sb.storage
            .from(BALDE_IMAGENS)
            .upload(nome, bytesDeBase64(b64), { contentType: `image/${tipo}`, upsert: true, cacheControl: '31536000' });
          if (error) throw new Error(`Imagem não subiu: ${error.message}`);
          enviadas += 1;
          feitas.set(inteiro, `${SUPABASE_URL}/storage/v1/object/public/${BALDE_IMAGENS}/${nome}`);
        }
        out = out.split(inteiro).join(feitas.get(inteiro));
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
  const limpo = await visitar(valor);
  return { limpo, enviadas };
}

/**
 * Publica. Devolve { chaves, imagens }.
 * @param {{ progresso?: (etapa: string) => void, todas?: boolean }} opcoes
 */
export async function publicarNaNuvem({ progresso = () => {} } = {}) {
  const sb = supabase();
  const { data: sessao } = await sb.auth.getSession();
  if (!sessao?.session) throw new Error('A sessão expirou: saia e entre de novo no painel.');

  progresso('Juntando o que mudou');
  const chaves = chavesEditadas();
  if (!chaves.length) {
    markPublished();
    return { chaves: 0, imagens: 0 };
  }

  const linhas = [];
  let imagens = 0;
  for (const chave of chaves) {
    let valor;
    try {
      valor = JSON.parse(localStorage.getItem(chave));
    } catch {
      continue;
    }
    const { limpo, enviadas } = await subirImagens(valor, progresso);
    imagens += enviadas;
    if (enviadas) localStorage.setItem(chave, JSON.stringify(limpo));
    linhas.push({ chave, valor: limpo });
  }

  progresso('Gravando no banco');
  const { data, error } = await sb.from('conteudo').upsert(linhas, { onConflict: 'chave' }).select('chave, atualizado_em');
  if (error) throw new Error(error.message);

  registrarPublicadas(data || []);
  markPublished();
  return { chaves: linhas.length, imagens };
}

/** Os inscritos nas Cartas (só o administrador consegue ler). */
export async function listarInscritos() {
  const { data, error } = await supabase()
    .from('cartas_inscritos')
    .select('id, email, origem, pagina, consentimento, criado_em')
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function apagarInscrito(id) {
  const { error } = await supabase().from('cartas_inscritos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** As últimas versões guardadas de uma chave (para desfazer). */
export async function historico(chave, limite = 10) {
  const { data, error } = await supabase()
    .from('conteudo_historico')
    .select('id, chave, versao_de, guardado_em')
    .eq('chave', chave)
    .order('guardado_em', { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return data || [];
}

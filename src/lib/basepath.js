// Prefixo para imagens e assets estáticos.
// Quando basePath muda no next.config.js, mude aqui também.
// Se for username.github.io (sem subpasta), deixe como string vazia ''.
export { BASE_PATH } from '@/lib/site';
import { BASE_PATH } from '@/lib/site';

export function img(path) {
  return `${BASE_PATH}${path}`;
}

/**
 * resolveImageSrc — normaliza URLs/paths de imagens vindos do admin/defaults.
 * - http(s): retorna sem tocar (CDN, externo)
 * - data:    retorna sem tocar (upload base64)
 * - /Psiangelo/...: já tem basePath, retorna direto
 * - /...: prefixa basePath
 * - outro: retorna como veio
 */
export function resolveImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (url.startsWith(BASE_PATH + '/')) return url;
  if (url.startsWith('/')) return img(url);
  return url;
}

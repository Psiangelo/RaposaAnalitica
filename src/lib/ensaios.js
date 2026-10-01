/**
 * Utilidades dos ensaios (sem 'use client': servem ao build e ao navegador).
 */

export function tempoDeLeitura(html) {
  if (!html) return 1;
  const palavras = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / 200));
}

/** Publicados, fixados primeiro, depois do mais novo para o mais velho. */
export function ordenarPublicados(posts = []) {
  return posts
    .filter((p) => p && (p.slug || p.id) && (!p.status || p.status === 'published'))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0);
    });
}

export function capaDoPost(post, formato = 'vertical') {
  if (!post) return '';
  return formato === 'vertical'
    ? post.featured_cover || post.featured_image || ''
    : post.featured_image || post.featured_cover || '';
}

export function hrefDoPost(post) {
  return `/blog/${post.slug || post.id}/`;
}

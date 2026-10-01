'use client';

import EnsaioCard from '@/components/blog/EnsaioCard';

/** Continuar lendo: até 3 ensaios, os da mesma tag ou série primeiro. */
function escolher(atual, todos, max = 3) {
  const tags = new Set(atual.tags || []);
  const outros = todos.filter((p) => p.id !== atual.id && (!p.status || p.status === 'published'));
  const pontuados = outros
    .map((p) => {
      let n = 0;
      for (const t of p.tags || []) if (tags.has(t)) n += 2;
      if (p.seriesId && p.seriesId === atual.seriesId) n += 3;
      return { p, n };
    })
    .sort((a, b) => b.n - a.n || new Date(b.p.created_at || 0) - new Date(a.p.created_at || 0));
  return pontuados.slice(0, max).map((x) => x.p);
}

export default function RelatedPosts({ currentPost, allPosts }) {
  const lista = escolher(currentPost, allPosts, 3);
  if (!lista.length) return null;
  return (
    <section className="mt-16 pt-10 border-t border-linha" data-reading-hide="true">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-accent mb-6">Continuar lendo</p>
      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-3">
        {lista.map((p) => (
          <EnsaioCard key={p.id || p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}

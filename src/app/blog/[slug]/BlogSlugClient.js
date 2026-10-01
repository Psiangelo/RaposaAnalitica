'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HiddenPlaceholder from '@/components/HiddenPlaceholder';
import { useVisibility } from '@/lib/useVisibility';
import { useSitedata } from '@/lib/useSitedata';
import { getBlogPosts, getBlogSeries, SITEDATA_KEYS } from '@/lib/sitedata';
import BlogPostView from '@/components/blog/BlogPostView';
import { BASE_PATH } from '@/lib/basepath';

/**
 * Cliente da rota /blog/[slug] — renderiza o post de verdade (não redireciona
 * mais pro SPA /blog?post=slug). O post/allPosts/seriesList vêm do snapshot
 * lido em build-time (page.js, server component) como `initial*`, e depois
 * seguem vivos via useSitedata (localStorage, overrides do admin).
 */
export default function BlogSlugClient({ slug, initialPost, initialAllPosts = [], initialSeriesList = [] }) {
  const { visibility, ready } = useVisibility();
  const allPosts = useSitedata(getBlogPosts, initialAllPosts, SITEDATA_KEYS.blog);
  const seriesList = useSitedata(getBlogSeries, initialSeriesList, SITEDATA_KEYS.blogSeries);

  const post =
    allPosts.find((p) => String(p.slug || p.id) === slug) ||
    initialPost;

  if (ready && !visibility.blog) {
    return <HiddenPlaceholder title="Blog indisponível" />;
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-5">
          <div className="text-center max-w-md">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-accent mb-4">
              Publicação não encontrada
            </p>
            <p className="font-serif italic text-text-dim text-base">
              <a href={`${BASE_PATH}/blog/`} className="text-accent underline underline-offset-4 hover:text-text-bright transition-colors">
                Voltar ao blog
              </a>
              .
            </p>
          </div>
        </main>
        <Footer showMaterialsCta={false} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <BlogPostView post={post} allPosts={allPosts} seriesList={seriesList} visibility={visibility} />
      </main>
      <Footer showMaterialsCta={false} />
    </>
  );
}

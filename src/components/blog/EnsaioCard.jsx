'use client';

import Link from 'next/link';
import { renderHighlightedTitle, stripHighlights } from '@/lib/highlightTitle';
import { resolveImageSrc } from '@/lib/basepath';
import { formatPostDate } from '@/lib/formatDate';
import { tempoDeLeitura, capaDoPost, hrefDoPost } from '@/lib/ensaios';
import TagSelo from '@/components/blog/TagSelo';
import CapaReserva from '@/components/blog/CapaReserva';
import Icone from '@/components/raposa/Icone';

const FRAUNCES = { fontVariationSettings: '"SOFT" 100, "WONK" 1' };

function Capa({ post, formato, className }) {
  const src = capaDoPost(post, formato);
  if (!src) return <CapaReserva post={post} className={className} />;
  const alt = (formato === 'vertical' ? post.featured_cover_alt : post.featured_image_alt) || stripHighlights(post.title);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveImageSrc(src)}
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      className={`object-cover transition-transform duration-700 group-hover:scale-[1.035] ${className}`}
    />
  );
}

export function MetaEnsaio({ post, className = '' }) {
  const data = post.created_at || post.updated_at;
  return (
    <p className={`flex items-center gap-2 font-sans text-[13px] text-text-dim ${className}`}>
      <time dateTime={data}>{formatPostDate(data)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Icone nome="relogio" size={13} /> {tempoDeLeitura(post.content_html)} min
      </span>
    </p>
  );
}

/**
 * Card de ensaio.
 *  - "vertical": capa 4:5, para grades (home, hub, relacionados)
 *  - "horizontal": capa à esquerda, texto à direita (listas)
 *  - "destaque": o grande da home e do hub
 */
export default function EnsaioCard({ post, variante = 'vertical', className = '' }) {
  const href = hrefDoPost(post);
  const tag = post.tags?.[0];

  if (variante === 'destaque') {
    return (
      <article
        className={`group relative grid lg:grid-cols-[1.25fr_1fr] rounded-[28px] overflow-hidden bg-bg-card border border-linha shadow-[0_24px_60px_-40px_rgb(19_33_31/0.6)] ${className}`}
      >
        <Link href={href} className="relative block aspect-[16/10] lg:aspect-auto lg:min-h-[440px] overflow-hidden" tabIndex={-1} aria-hidden="true">
          <Capa post={post} formato="horizontal" className="absolute inset-0 w-full h-full" />
        </Link>
        <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="font-sans text-[12px] font-semibold tracking-[0.2em] uppercase text-accent-bright">Em destaque</span>
            {tag && <TagSelo tag={tag} tamanho="sm" />}
          </div>
          <h3 className="font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.04] font-bold text-text-bright tracking-[-0.01em]" style={FRAUNCES}>
            <Link href={href} className="hover:text-accent transition-colors">
              {renderHighlightedTitle(post.title)}
            </Link>
          </h3>
          {post.excerpt && <p className="mt-4 font-body text-[1.06rem] leading-relaxed text-text max-w-[46ch]">{post.excerpt}</p>}
          <MetaEnsaio post={post} className="mt-5" />
          <Link href={href} className="mt-7 self-start btn btn--solid">
            Ler o ensaio <Icone nome="seta" size={17} />
          </Link>
        </div>
      </article>
    );
  }

  if (variante === 'horizontal') {
    return (
      <article className={`group grid grid-cols-[104px_1fr] sm:grid-cols-[180px_1fr] gap-4 sm:gap-6 items-start ${className}`}>
        <Link href={href} className="relative block aspect-[4/5] rounded-2xl overflow-hidden" tabIndex={-1} aria-hidden="true">
          <Capa post={post} formato="vertical" className="absolute inset-0 w-full h-full" />
        </Link>
        <div className="min-w-0 pt-1">
          {tag && <TagSelo tag={tag} tamanho="sm" className="mb-2.5" />}
          <h3 className="font-serif text-[1.3rem] sm:text-[1.55rem] leading-[1.12] font-semibold text-text-bright" style={FRAUNCES}>
            <Link href={href} className="hover:text-accent transition-colors">
              {renderHighlightedTitle(post.title)}
            </Link>
          </h3>
          {post.excerpt && <p className="mt-2 font-body text-[0.98rem] leading-relaxed text-text line-clamp-3">{post.excerpt}</p>}
          <MetaEnsaio post={post} className="mt-3" />
        </div>
      </article>
    );
  }

  return (
    <article className={`group flex flex-col h-full ${className}`}>
      <Link
        href={href}
        className="relative block aspect-[4/5] rounded-[22px] overflow-hidden shadow-[0_18px_40px_-30px_rgb(19_33_31/0.7)]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Capa post={post} formato="vertical" className="absolute inset-0 w-full h-full" />
        {tag && (
          <span className="absolute left-3 top-3">
            <TagSelo tag={tag} tamanho="sm" />
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-1 pt-4 px-1">
        <h3 className="font-serif text-[1.4rem] leading-[1.12] font-semibold text-text-bright" style={FRAUNCES}>
          <Link href={href} className="hover:text-accent transition-colors">
            {renderHighlightedTitle(post.title)}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 font-body text-[0.97rem] leading-relaxed text-text line-clamp-3">{post.excerpt}</p>}
        <MetaEnsaio post={post} className="mt-auto pt-3" />
      </div>
    </article>
  );
}

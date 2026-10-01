import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
/**
 * Rota estática por post — HTML de verdade no export estático (título, data,
 * autor, tags e o content_html completo), não mais um redirect client-side.
 * Isso é o que torna o blog rastreável pelo Google: antes, essa rota fazia
 * `window.location.replace('/blog?post=slug')` e o crawler via conteúdo
 * vazio; agora o post inteiro sai no HTML gerado no build.
 *
 * generateStaticParams lê o snapshot publicado (src/data/site-content.json)
 * e gera um HTML por slug no export estático.
 */

import siteContent from '@/data/site-content.json';
import BlogSlugClient from './BlogSlugClient';

const SITE_URL = SITE_URL_FROM_LIB;

// Remove marcação *asterisco* de destaque — contexto de texto puro
function stripHighlights(t) {
  return typeof t === 'string' ? t.replace(/\*([^*]+)\*/g, '$1') : (t ?? '');
}

function getAllPosts() {
  const posts = siteContent?.data?.raposa_admin_blog;
  return Array.isArray(posts) ? posts : [];
}

function getSeriesList() {
  const series = siteContent?.data?.raposa_admin_blog_series;
  return Array.isArray(series) ? series : [];
}

function getPosts() {
  return getAllPosts().filter((p) => p && (p.slug || p.id) && (!p.status || p.status === 'published'));
}

export function generateStaticParams() {
  const posts = getPosts();
  if (posts.length === 0) {
    // Next 14 + output:'export' exige ao menos um param. Gera um
    // placeholder que redireciona pro blog — some assim que houver posts.
    return [{ slug: '__placeholder__' }];
  }
  return posts.map((p) => ({ slug: String(p.slug || p.id) }));
}

export function generateMetadata({ params }) {
  const posts = getPosts();
  const post = posts.find((p) => String(p.slug || p.id) === params.slug);

  if (!post) {
    return {
      title: 'Publicação — Raposa Analítica',
    };
  }

  const title = stripHighlights(post.title) || 'Publicação';
  const description = buildDescription(post);
  const slug = post.slug || post.id;
  const ogImage  = `${SITE_URL}/og/posts/${slug}.jpg`;
  const ogImageV = `${SITE_URL}/og/posts-v/${slug}.jpg`;
  // trailingSlash:true no next.config — canonical precisa bater com a rota real
  const url = `${SITE_URL}/blog/${slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'pt_BR',
      url,
      siteName: 'Raposa Analítica',
      title,
      description,
      /**
       * ⚠️ UMA imagem só. Não voltar a declarar várias.
       *
       * Antes eram três (vertical, horizontal e o og-square genérico), na
       * suposição de que o WhatsApp pegaria a primeira. Ele não pega: com
       * múltiplas `og:image`, o scraper ficou com a ÚLTIMA — justamente o
       * fallback genérico "Raposa Analítica · Nosce te ipsum". O resultado era todo
       * link compartilhado sair com a marca genérica em vez da capa do post,
       * mesmo com as imagens certas geradas e servindo 200 (30/07/2026).
       *
       * A escolhida é a horizontal 1200×630: já traz a capa do post com o
       * título sobreposto, e é a proporção que rende preview grande no
       * WhatsApp, no Telegram, no Facebook e no LinkedIn. A vertical continua
       * sendo gerada e usada no site; ela não serve aqui porque scraper de
       * mensageiro corta imagem muito alta.
       *
       * Sem fallback genérico de propósito: o gerador (scripts/gen-og-posts)
       * cobre todo post publicado, e post sem capa ganha o ornamento
       * geométrico com o título. Um fallback aqui só reintroduz o bug.
       */
      images: [
        { url: ogImage, width: 1200, height: 630, alt: title, type: 'image/jpeg' },
      ],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      tags: post.tags || [],
    },
    twitter: {
      // Twitter lida melhor com a horizontal
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

function stripHtml(s) {
  return typeof s === 'string' ? s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

// Descrição de compartilhamento: excerpt do painel; se vazio, deriva das
// primeiras linhas do content_html (mesmo texto usado no schema.org abaixo).
// Só cai no texto institucional genérico quando não há conteúdo real algum.
function buildDescription(post) {
  const excerpt = stripHighlights(post.excerpt);
  if (excerpt) return excerpt;
  const fromContent = stripHtml(post.content_html);
  if (fromContent) {
    return fromContent.length > 200 ? `${fromContent.slice(0, 197).trim()}…` : fromContent;
  }
  return 'Ensaio da Raposa Analítica sobre a obra de Carl Gustav Jung.';
}

function buildBlogPostingSchema(post) {
  if (!post) return null;
  const slug = post.slug || post.id;
  const url = `${SITE_URL}/blog/${slug}/`;
  const title = stripHighlights(post.title) || 'Publicação';
  const description = buildDescription(post);
  const body = stripHtml(post.content_html);
  const wordCount = body ? body.split(/\s+/).filter(Boolean).length : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: title,
    description,
    // Horizontal primeiro: o Google aceita várias proporções aqui (ao
    // contrário do og:image, que precisa ser uma só — ver comentário acima).
    image: [
      `${SITE_URL}/og/posts/${slug}.jpg`,
      `${SITE_URL}/og/posts-v/${slug}.jpg`,
    ],
    datePublished: post.created_at || post.updated_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}#person`,
      name: post.author || 'Angelo',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Raposa Analítica',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-square.png`,
      },
    },
    keywords: (post.tags || []).join(', ') || undefined,
    wordCount,
    inLanguage: 'pt-BR',
    url,
  };
}

export default function BlogSlugPage({ params }) {
  const post = getPosts().find((p) => String(p.slug || p.id) === params.slug);
  const schema = buildBlogPostingSchema(post);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <BlogSlugClient
        slug={params.slug}
        initialPost={post || null}
        initialAllPosts={getAllPosts()}
        initialSeriesList={getSeriesList()}
      />
    </>
  );
}

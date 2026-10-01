import { notFound } from 'next/navigation';
import siteContent from '@/data/site-content.json';
import { glossario as GLOSSARIO_DEFAULT, CATEGORIES as CATEGORIES_DEFAULT } from '@/data/glossario';
import { buildGlossaryEntries, scanGlossaryMentions } from '@/lib/glossaryLinker';
import TermoClient from './TermoClient';

/**
 * getList/getCategories replicam EXATAMENTE normalizeGlossario() /
 * normalizeGlossarioCategories() de src/lib/sitedata.js (mesma fonte —
 * raposa_admin_glossario / raposa_admin_glossario_categories do snapshot
 * publicado, com o mesmo fallback pro default hardcoded).
 *
 * Não importamos getGlossario/getGlossarioCategories de @/lib/sitedata
 * diretamente aqui de propósito: esse módulo é 'use client', e
 * generateStaticParams/generateMetadata rodam em build-time, fora de
 * qualquer client boundary — importar um módulo client faz o Next
 * substituir os exports por referências client, que quebram o build
 * ("TypeError: o is not a function") quando chamadas como função comum.
 * Se normalizeGlossario() mudar de forma em sitedata.js, replique aqui.
 *
 * Antes deste arquivo lia src/data/glossario.js direto, ignorando o
 * snapshot publicado: um verbete editado/criado no painel (GlossarioManager)
 * não entrava aqui — nem era autolinkado nos ensaios, nem aparecia no
 * índice de "ensaios que tratam deste termo" abaixo — sem nenhum erro
 * visível.
 */
function getList() {
  const stored = siteContent?.data?.raposa_admin_glossario;
  const base = Array.isArray(stored) && stored.length > 0 ? stored : GLOSSARIO_DEFAULT;
  return base.map((g, i) => ({
    slug: g.slug ?? `verbete-${i}`,
    term: g.term ?? 'Verbete',
    aliases: Array.isArray(g.aliases) ? g.aliases : [],
    category: g.category ?? 'estrutura',
    short: g.short ?? '',
    full: g.full ?? '',
    related: {
      terms: g.related?.terms ?? [],
      materials: g.related?.materials ?? [],
    },
    links: Array.isArray(g.links) ? g.links : [],
    hidden: !!g.hidden,
    ordem: typeof g.ordem === 'number' ? g.ordem : i,
  }));
}

function getCategories() {
  const stored = siteContent?.data?.raposa_admin_glossario_categories;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored
      .map((c, i) => ({
        slug: c.slug ?? `cat-${i}`,
        label: c.label ?? 'Categoria',
        tone: c.tone ?? 'accent',
        ordem: typeof c.ordem === 'number' ? c.ordem : i,
      }))
      .sort((a, b) => a.ordem - b.ordem);
  }
  return Object.entries(CATEGORIES_DEFAULT).map(([slug, info], i) => ({ slug, label: info.label, tone: info.tone, ordem: i }));
}

function getPosts() {
  const posts = siteContent?.data?.raposa_admin_blog;
  return Array.isArray(posts) ? posts : [];
}

function getCourses() {
  const courses = siteContent?.data?.raposa_admin_courses;
  return Array.isArray(courses) ? courses : [];
}

/**
 * Ensaios que mencionam este termo — fecha o ciclo ensaio → verbete →
 * ensaio (link interno bidirecional, bom pra SEO de silo temático).
 * Reaproveita o mesmo scanner usado pro autolink em BlogPostView (sem a
 * exclusão de auto-termo: o ensaio que É sobre "Sombra" deve aparecer aqui
 * mesmo que não autolinke a si mesmo). Roda em build-time, uma vez por
 * termo — custo desprezível (dezenas de posts, não milhares).
 */
function getRelatedEssays(slug, glossarioList) {
  const entries = buildGlossaryEntries(glossarioList);
  if (entries.length === 0) return [];
  const posts = getPosts().filter((p) => p && (p.slug || p.id) && (!p.status || p.status === 'published'));
  const out = [];
  for (const post of posts) {
    if (!post.content_html) continue;
    const mentions = scanGlossaryMentions(post.content_html, entries);
    if (mentions.includes(slug)) {
      out.push({
        slug: post.slug || post.id,
        title: post.title || 'Sem título',
        excerpt: post.excerpt || '',
        // capa: mesma precedência que os cards do blog usam
        cover: post.featured_cover || post.featured_image || '',
        coverAlt: post.featured_cover_alt || post.featured_image_alt || '',
        tags: post.tags || [],
        date: post.updated_at || post.created_at || null,
      });
    }
  }
  // mais recente primeiro, para o ensaio novo aparecer antes
  return out.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

export function generateStaticParams() {
  return getList().map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const term = getList().find((t) => t.slug === params.slug);
  if (!term) return {};
  return {
    title: term.term,
    description: term.short,
    openGraph: {
      title: `${term.term} · Glossário junguiano`,
      description: term.short,
      type: 'article',
    },
  };
}

export default function TermoPage({ params }) {
  const list = getList();
  const termo = list.find((t) => t.slug === params.slug);
  if (!termo) return notFound();
  const categories = getCategories();
  return (
    <TermoClient
      initialTermo={termo}
      initialList={list}
      initialCategories={categories}
      initialPosts={getPosts()}
      initialCourses={getCourses()}
      relatedEssays={getRelatedEssays(params.slug, list)}
    />
  );
}

import { DEFAULT_AREA_ID } from '@/lib/areas';
import { defaultIconForKind, DEFAULT_TRILHA_ICON } from '@/lib/trilhaIcons';

/**
 * linkResolver — resolve um `link` rico em uma URL navegável + metadados.
 *
 * Usado por Trilhas, Glossário e /trilhas para evitar duplicar a lógica
 * de "como abrir um post do blog vs um material vs um vídeo".
 *
 * Forma do link:
 *   { kind: 'material' | 'blog' | 'course' | 'youtube' | 'drive' | 'embed' | 'url' | 'none',
 *     value: string,   // id, slug ou URL conforme o kind
 *     label?: string,  // override opcional do título mostrado }
 *
 * Retorno: { href, label, kindLabel, isExternal, embed?: { provider, src } }
 *   - href: 'string|null'   — para usar em <Link> ou <a>. null quando kind=none ou faltam dados.
 *   - label: string         — título que cai bem em UI
 *   - kindLabel: string     — rótulo do tipo (ex.: "Post do blog", "Vídeo YouTube")
 *   - isExternal: boolean   — abre em nova aba quando true
 *   - embed: { provider, src } | undefined — quando o player pode ser embutido
 */

const KIND_LABEL = {
  material: 'Material',
  blog: 'Blog',
  course: 'Curso',
  youtube: 'Vídeo · YouTube',
  drive: 'Vídeo · Drive',
  embed: 'Embed',
  url: 'Link',
  none: 'Sem link',
};

function ytEmbedSrc(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.replace('/shorts/', '').split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    /* not a URL */
  }
  return null;
}

function driveEmbedSrc(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('drive.google.com')) return null;
    // /file/d/<id>/view → /file/d/<id>/preview
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    return url;
  } catch {
    return null;
  }
}

export function resolveLink(link, { materials = [], posts = [], courses = [], glossario = [] } = {}) {
  if (!link || !link.kind || link.kind === 'none' || !link.value) {
    return { href: null, label: link?.label || '', kindLabel: KIND_LABEL.none, isExternal: false };
  }
  const { kind, value, label } = link;

  if (kind === 'material') {
    const m = materials.find((x) => x.id === value);
    return {
      href: `/materiais#${value}`,
      label: label || m?.title || value,
      kindLabel: KIND_LABEL.material,
      isExternal: false,
    };
  }

  if (kind === 'blog') {
    const p = posts.find((x) => (x.slug || x.id) === value);
    // ensaio apagado ou despublicado: sem link morto (quem chama esconde o bloco)
    if (posts.length && !p) {
      return { href: null, label: label || '', kindLabel: KIND_LABEL.blog, isExternal: false, missing: true };
    }
    return {
      href: `/blog/${value}`,
      label: label || String(p?.title || value).replace(/\*([^*]+)\*/g, '$1'),
      kindLabel: KIND_LABEL.blog,
      isExternal: false,
    };
  }

  if (kind === 'course') {
    const c = courses.find((x) => (x.slug || x.id) === value);
    return {
      href: `/cursos?id=${encodeURIComponent(value)}`,
      label: label || c?.title || value,
      kindLabel: KIND_LABEL.course,
      isExternal: false,
    };
  }

  if (kind === 'glossario') {
    const g = glossario.find((x) => x.slug === value);
    return {
      href: `/verbetes/${value}`,
      label: label || g?.term || value,
      kindLabel: 'Verbete',
      isExternal: false,
    };
  }

  if (kind === 'youtube') {
    const src = ytEmbedSrc(value);
    return {
      href: value,
      label: label || 'Vídeo no YouTube',
      kindLabel: KIND_LABEL.youtube,
      isExternal: true,
      embed: src ? { provider: 'youtube', src } : undefined,
    };
  }

  if (kind === 'drive') {
    const src = driveEmbedSrc(value);
    return {
      href: value,
      label: label || 'Vídeo no Drive',
      kindLabel: KIND_LABEL.drive,
      isExternal: true,
      embed: src ? { provider: 'drive', src } : undefined,
    };
  }

  if (kind === 'embed') {
    // value é HTML cru (iframe, etc.) — quem renderizar deve passar via dangerouslySetInnerHTML
    return {
      href: null,
      label: label || 'Conteúdo embutido',
      kindLabel: KIND_LABEL.embed,
      isExternal: false,
      embed: { provider: 'raw', html: value },
    };
  }

  if (kind === 'url') {
    const isExternal = typeof value === 'string' && /^https?:\/\//i.test(value);
    return {
      href: value,
      label: label || value,
      kindLabel: KIND_LABEL.url,
      isExternal,
    };
  }

  // Fallback: kind desconhecido vira link externo se for URL
  return { href: value, label: label || value, kindLabel: kind, isExternal: /^https?:\/\//i.test(value) };
}

export const LINK_KINDS = [
  { value: 'none',     label: 'Sem link (texto livre)' },
  { value: 'material', label: 'Material do catálogo' },
  { value: 'blog',     label: 'Post do blog' },
  { value: 'course',   label: 'Curso' },
  { value: 'glossario',label: 'Verbete do glossário' },
  { value: 'youtube',  label: 'Vídeo do YouTube' },
  { value: 'drive',    label: 'Vídeo/arquivo do Google Drive' },
  { value: 'embed',    label: 'HTML embutido (iframe)' },
  { value: 'url',      label: 'URL livre' },
];

/** Migra stage antigo ({ material, href }) para shape novo ({ link: {kind, value} }) */
export function migrateStageLink(stage) {
  if (stage?.link && stage.link.kind) return stage;
  if (stage?.material) {
    return { ...stage, link: { kind: 'material', value: stage.material } };
  }
  if (stage?.href) {
    return { ...stage, link: { kind: 'url', value: stage.href } };
  }
  return { ...stage, link: { kind: 'none', value: '' } };
}

/**
 * Tipos de bloco aceitos por uma etapa de trilha:
 *   { type: 'text',        body: string }                            — markdown leve
 *   { type: 'link',        link: { kind, value, label? } }           — card clicável (linkResolver)
 *   { type: 'media',       provider: 'youtube'|'drive', url, caption? } — player inline
 *   { type: 'embed',       html: string, caption? }                  — iframe cru
 *   { type: 'cartography', slug: string, caption? }                  — CartographyView por slug
 *   { type: 'quote',       body: string, cite? }                     — citação
 */
export const BLOCK_KINDS = [
  { value: 'text',        label: 'Texto (markdown)' },
  { value: 'link',        label: 'Link / card (material, post, curso, verbete, URL)' },
  { value: 'media',       label: 'Vídeo (YouTube/Drive) embutido' },
  { value: 'embed',       label: 'Embed HTML (iframe)' },
  { value: 'cartography', label: 'Cartografia embutida' },
  { value: 'quote',       label: 'Citação destacada' },
  { value: 'substage',    label: 'Sub-etapa (concluível, com mídia + texto dentro)' },
];

/** Tipos permitidos DENTRO de um substage (filtra `substage` aninhado). */
export const INNER_BLOCK_KINDS = BLOCK_KINDS.filter((k) => k.value !== 'substage');

/** Garante shape consistente de um bloco substage (incluindo blocks internos). */
export function migrateSubstage(substage, idx = 0) {
  if (!substage || substage.type !== 'substage') return substage;
  const innerBlocks = Array.isArray(substage.blocks)
    ? substage.blocks.filter((b) => b && b.type && b.type !== 'substage')
    : [];
  return {
    type: 'substage',
    id: substage.id || `substage-${idx}-${Date.now().toString(36).slice(-4)}`,
    title: substage.title || `Sub-etapa ${idx + 1}`,
    intro: typeof substage.intro === 'string' ? substage.intro : '',
    extra: substage.extra === true,
    blocks: innerBlocks,
  };
}

function slugifyTitle(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Migra stage antigo (com `link` singular) para shape novo com `blocks[]`.
 * - Se já tem `blocks`, retorna intacto
 * - Se tem `link`, vira blocks: [{type:'link', link}]
 * - Adiciona `slug` derivado do título quando ausente
 * - Preserva `detail` como `summary`
 */
export function migrateStageToBlocks(stage, idx = 0) {
  const migrated = migrateStageLink(stage || {});
  const kind = migrated.kind || 'leitura';
  const base = {
    id: migrated.id || `stage-${idx}-${Date.now().toString(36).slice(-4)}`,
    slug: migrated.slug || slugifyTitle(migrated.title || `etapa-${idx + 1}`),
    title: migrated.title || `Etapa ${idx + 1}`,
    kind,
    icon: migrated.icon || defaultIconForKind(kind),
    intro: typeof migrated.intro === 'string' ? migrated.intro : '',
    summary: migrated.summary || migrated.detail || '',
    coverImage: migrated.coverImage || '',
    thumbMode: migrated.thumbMode === 'icon' ? 'icon' : 'image',
    extra: migrated.extra === true,
    hidden: migrated.hidden === true,
    comingSoon: migrated.comingSoon === true,
  };
  if (Array.isArray(migrated.blocks) && migrated.blocks.length > 0) {
    // Normaliza substages dentro dos blocks (garante id, filtra aninhamento)
    let substageIdx = 0;
    const normalizedBlocks = migrated.blocks.map((b) => {
      if (b?.type === 'substage') {
        const m = migrateSubstage(b, substageIdx);
        substageIdx += 1;
        return m;
      }
      return b;
    });
    return { ...base, blocks: normalizedBlocks };
  }
  // Constrói blocks a partir do link antigo
  const blocks = [];
  if (migrated.link && migrated.link.kind !== 'none' && migrated.link.value) {
    blocks.push({ type: 'link', link: migrated.link });
  }
  return { ...base, blocks };
}

export function migrateTrilhaBlocks(trilha) {
  if (!trilha) return trilha;
  return {
    ...trilha,
    area: trilha.area || DEFAULT_AREA_ID,
    icon: trilha.icon || DEFAULT_TRILHA_ICON,
    thumbMode: trilha.thumbMode === 'icon' ? 'icon' : 'image',
    extra: trilha.extra === true,
    hidden: trilha.hidden === true,
    comingSoon: trilha.comingSoon === true,
    stages: (trilha.stages || []).map((s, i) => migrateStageToBlocks(s, i)),
  };
}

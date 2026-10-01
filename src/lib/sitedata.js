'use client';

/**
 * sitedata — camada de leitura/escrita do conteúdo gerenciado pelo admin.
 *
 * Todo conteúdo do site (trilhas, cartografia, textos editoriais)
 * tem um "default" hardcoded em src/data/* e pode ser sobrescrito
 * pelo admin gravando no localStorage. As páginas públicas chamam
 * `getX()` que devolve o gerenciado, ou cai no default.
 *
 * Padrão é compatível com server-render: getters retornam default
 * quando window não existe; o componente cliente reidrata via useEffect.
 */

import { trilhas as TRILHAS_DEFAULT } from '@/data/trilhas';
// O catálogo de resumos do Psiangelo não veio para a Raposa: a loja tem
// modelo próprio (getLoja). Materiais fica vazio, só para não quebrar quem
// ainda consulta (links de trilha do tipo «material»).
const MATERIALS_DEFAULT = [];
const COMING_SOON_DEFAULT = [];
import { DEFAULT_AREAS, normalizeAreas } from '@/lib/areas';
import siteContentSnapshot from '@/data/site-content.json';

/**
 * SNAPSHOT_DATA — o mesmo conteúdo publicado que ContentBootstrap grava no
 * localStorage do visitante (ou snapshot.data, quando Supabase não está
 * configurado). Servindo de "seed" em build-time: quando não há valor no
 * localStorage (SSR/export estático, ou primeiro paint do cliente antes do
 * ContentBootstrap rodar), os getters abaixo caem nesse snapshot em vez do
 * default hardcoded — assim o HTML gerado estaticamente já sai com o
 * conteúdo publicado, e o primeiro render do cliente bate byte-a-byte com
 * esse HTML (mesmo import, mesmo valor, nos dois ambientes).
 */
const SNAPSHOT_DATA = siteContentSnapshot?.data || {};

export const SITEDATA_KEYS = {
  trilhas:        'raposa_admin_trilhas',
  cartoNodes:     'raposa_admin_cartography_nodes',
  cartoEdges:     'raposa_admin_cartography_edges',
  homepage:       'raposa_admin_homepage',
  bio:            'raposa_admin_bio',
  visibility:     'raposa_admin_visibility',
  materials:      'raposa_admin_materials',
  comingSoon:     'raposa_admin_coming_soon',
  testimonials:   'raposa_admin_testimonials',
  faqs:           'raposa_admin_faqs',
  settings:       'raposa_admin_settings',
  homeSections:   'raposa_admin_home_sections',
  homeSectionsLayout: 'raposa_admin_home_sections_layout',
  categories:     'raposa_admin_categories',
  contentTypes:   'raposa_admin_content_types',
  materiaisPage:  'raposa_admin_materiais_page',
  glossario:      'raposa_admin_glossario',
  glossarioCategories: 'raposa_admin_glossario_categories',
  glossarioPage:  'raposa_admin_glossario_page',
  estudosPage:    'raposa_admin_estudos_page',
  cartographies:  'raposa_admin_cartographies',
  areas:          'raposa_admin_areas',
  labels:         'raposa_admin_labels',
  blogAuthorCta:  'raposa_admin_blog_author_cta',
  blog:           'raposa_admin_blog',
  blogSeries:     'raposa_admin_blog_series',
  servicos:       'raposa_admin_servicos',
  loja:           'raposa_admin_loja',
  newsletter:     'raposa_admin_newsletter',
  tagEstilos:     'raposa_admin_tag_estilos',
};

/* ===================================================================
   DEFAULTS
=================================================================== */

export const DEFAULT_CARTO_NODES = [
  { id: 'self',     label: 'Self',                  x: 400, y: 260, size: 28, tone: 'accent',   axiom: 'centro arquetípico',         href: '/trilhas' },
  { id: 'ego',      label: 'Ego',                   x: 290, y: 200, size: 18, tone: 'bright',   axiom: 'sujeito da consciência',     href: '' },
  { id: 'persona',  label: 'Persona',               x: 200, y: 130, size: 16, tone: 'bright',   axiom: 'máscara social',             href: '' },
  { id: 'sombra',   label: 'Sombra',                x: 250, y: 360, size: 22, tone: 'rubedo',   axiom: 'o que não se quis ser',      href: '/materiais#projecao' },
  { id: 'anima',    label: 'Anima',                 x: 540, y: 170, size: 20, tone: 'citrinit', axiom: 'feminino interior',          href: '' },
  { id: 'animus',   label: 'Animus',                x: 600, y: 330, size: 20, tone: 'citrinit', axiom: 'masculino interior',         href: '' },
  { id: 'incol',    label: 'Inconsciente Coletivo', x: 700, y: 200, size: 18, tone: 'accent',   axiom: 'substrato comum',            href: '' },
  { id: 'arc',      label: 'Arquétipo',             x: 660, y: 100, size: 16, tone: 'bright',   axiom: 'forma a priori',             href: '/materiais#hermeneutica-psicologia' },
  { id: 'complexo', label: 'Complexo',              x: 130, y: 280, size: 18, tone: 'bright',   axiom: 'núcleo afetivo autônomo',    href: '/materiais#consciencia-complexo-ego' },
  { id: 'sincron',  label: 'Sincronicidade',        x: 130, y: 440, size: 16, tone: 'rubedo',   axiom: 'sentido sem causa',          href: '' },
  { id: 'individ',  label: 'Individuação',          x: 460, y: 460, size: 24, tone: 'accent',   axiom: 'tornar-se quem se é',        href: '/trilhas/aprofundando-na-clinica' },
  { id: 'mito',     label: 'Mito Pessoal',          x: 690, y: 450, size: 16, tone: 'citrinit', axiom: 'narrativa da alma',          href: '/blog' },
];

export const DEFAULT_CARTO_EDGES = [
  ['self', 'ego'],
  ['self', 'individ'],
  ['self', 'incol'],
  ['ego', 'persona'],
  ['ego', 'sombra'],
  ['ego', 'complexo'],
  ['sombra', 'individ'],
  ['anima', 'self'],
  ['animus', 'self'],
  ['anima', 'arc'],
  ['animus', 'arc'],
  ['arc', 'incol'],
  ['complexo', 'sombra'],
  ['complexo', 'sincron'],
  ['individ', 'mito'],
  ['mito', 'incol'],
  ['sincron', 'incol'],
];

export const CARTO_TONES = ['accent', 'bright', 'citrinit', 'rubedo'];

/* Os textos padrão da Raposa são os do primeiro conteúdo publicado
   (scripts/_seed-raposa.mjs). Ficam aqui como rede de segurança: valem só
   quando o snapshot não tem a chave. */
const SEED = SNAPSHOT_DATA;

export const DEFAULT_HOMEPAGE = {
  hero: {
    eyebrow: 'Psicologia analítica · a obra de Jung',
    titlePrefix: 'A floresta é o',
    titleEmphasis: 'inconsciente',
    tagline: 'e a raposa conhece as trilhas.',
    lead: 'Ensaios, verbetes e trilhas de leitura sobre Carl Gustav Jung, escritos devagar e com a referência de cada coisa, para você ir à fonte.',
    quote: 'A floresta escura e impenetrável como a profundeza da água e do mar é o continente do desconhecido e do mistério. É uma metáfora apropriada para o inconsciente.',
    quoteSource: 'OC 13 §241',
    primaryLabel: 'Ler os ensaios',
    primaryHref: '/blog',
    secondaryLabel: 'Começar uma trilha',
    secondaryHref: '/trilhas',
    ...(SEED.raposa_admin_homepage?.hero || {}),
  },
  about: {
    title: 'Quem escreve',
    paragraph1: '',
    paragraph2: '',
    paragraph3: '',
    quoteText: '',
    quoteAuthor: '',
    credentials: [],
    gostos: [],
    milestones: [],
    images: [],
    ...(SEED.raposa_admin_homepage?.about || {}),
  },
  newsletter: {
    eyebrow: 'Cartas da Raposa',
    title: 'Uma carta quando a raposa',
    emphasis: 'acha alguma coisa.',
    lead: 'Ensaio novo, verbete novo, trilha nova, e de vez em quando um achado das notas de rodapé de Jung.',
    buttonLabel: 'Quero receber',
    buttonLoadingLabel: 'Enviando…',
    successMessage: 'Pronto. A próxima carta chega no seu e-mail.',
    alreadySubscribedMessage: 'Você já está na lista. Obrigado.',
    errorMessage: 'Não deu para confirmar agora. Tenta de novo em instantes.',
    ...(SEED.raposa_admin_homepage?.newsletter || {}),
  },
  contact: {
    sectionLabel: 'Converse comigo',
    title: 'Bata no shoji',
    lead: 'Dúvida sobre um ensaio, pedido de pesquisa, ideia de parceria ou só vontade de conversar sobre Jung.',
    primaryLabel: 'Canal principal',
    primaryHeadingPrefix: 'Pelo',
    primaryHeadingEmphasis: 'WhatsApp',
    primaryText: 'Me conta em poucas linhas o que você quer. Costumo responder no mesmo dia.',
    primaryButton: 'Abrir conversa',
    whatsappNumber: '5581987349114',
    instagramLabel: 'Instagram',
    instagramValue: '@raposaanalitica',
    instagramUrl: 'https://www.instagram.com/raposaanalitica/',
    emailLabel: 'E-mail',
    emailValue: '',
    ...(SEED.raposa_admin_homepage?.contact || {}),
  },
};

const DEFAULT_AUTHOR = {
  name: 'Ângelo',
  credential: 'Estudante de psicologia · leitor de Jung',
  bio: 'Leio Jung faz um tempo, e aqui eu conto o que vou achando.',
  photo: { src: '/raposa/fig/perfil-raposa-oculos.webp', alt: 'A Raposa Analítica: uma raposa de óculos redondos e cachimbo' },
  disclaimer: 'Não atendo nem dou diagnóstico por aqui.',
};

export const DEFAULT_BIO = {
  name: 'Raposa Analítica',
  tagline: 'Psicologia analítica · Jung',
  bio: 'Uma raposa estudante de psicologia lendo a obra de Jung e contando o que acha pelo caminho.',
  avatar: '/raposa/fig/perfil-raposa-oculos.webp',
  author: DEFAULT_AUTHOR,
  images: [],
  links: [
    { label: 'Ensaios', href: '/blog', image: '', icon: 'pincel', accent: 'mata', description: 'Textos longos, uma pergunta de cada vez.' },
    { label: 'Converse comigo', href: 'https://wa.me/5581987349114', image: '', icon: 'whatsapp', accent: 'noite', description: 'Dúvidas, encomendas e conversa.' },
  ],
};

/* ===================================================================
   READ HELPERS — server-safe (devolvem default sem window)
=================================================================== */

/**
 * readJson — leitor genérico storage-first com seed do snapshot.
 *
 * @param key       chave do localStorage (e do snapshot.data)
 * @param fallback  default hardcoded, usado só quando o snapshot também não tem a chave
 * @param seedOnly  quando true, IGNORA localStorage e devolve sempre o valor
 *                  determinístico (snapshot ?? fallback) — usado para computar
 *                  o estado inicial de hooks (useSitedata/useVisibility), pra
 *                  garantir que o primeiro render do cliente bata com o HTML
 *                  gerado no build (que nunca teve acesso a localStorage).
 */
function readJson(key, fallback, seedOnly = false) {
  const seedFallback = Object.prototype.hasOwnProperty.call(SNAPSHOT_DATA, key)
    ? SNAPSHOT_DATA[key]
    : fallback;
  if (seedOnly || typeof window === 'undefined') return seedFallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return seedFallback;
    const parsed = JSON.parse(raw);
    return parsed ?? seedFallback;
  } catch {
    return seedFallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // storage event só dispara entre abas; emitimos custom pra reagir na mesma aba
    try {
      window.dispatchEvent(new CustomEvent('sitedata:changed', { detail: { key } }));
    } catch {
      /* noop */
    }
    return true;
  } catch (err) {
    console.error(`[sitedata] falha ao salvar ${key}:`, err);
    return false;
  }
}

export const getTrilhas    = (seedOnly) => readJson(SITEDATA_KEYS.trilhas, TRILHAS_DEFAULT, seedOnly);
export const setTrilhas    = (v) => writeJson(SITEDATA_KEYS.trilhas, v);

/* ===================================================================
   BLOG — posts + séries. Não tinha entrada formal em SITEDATA_KEYS antes;
   adicionado pra que /blog e /blog/[slug] sigam o mesmo padrão seed-first
   dos demais getters (em vez de ler localStorage cru em cada componente).
=================================================================== */
export const getBlogPosts = (seedOnly) => {
  const posts = readJson(SITEDATA_KEYS.blog, [], seedOnly);
  return Array.isArray(posts) ? posts : [];
};
export const setBlogPosts = (v) => writeJson(SITEDATA_KEYS.blog, v);

export const getPublishedBlogPosts = (seedOnly) =>
  getBlogPosts(seedOnly).filter((p) => p && (p.slug || p.id) && (!p.status || p.status === 'published'));

export const getBlogSeries = (seedOnly) => {
  const series = readJson(SITEDATA_KEYS.blogSeries, [], seedOnly);
  return Array.isArray(series) ? series : [];
};

/* ===================================================================
   ÁREAS — categorias de trilhas (psicologia junguiana, filosofia, ...)
   Cada trilha referencia uma área (slug). A área dita ícone + accent
   visual no listing /trilhas e na detail.
=================================================================== */

export { DEFAULT_AREAS } from '@/lib/areas';
export const getAreas = (seedOnly) => normalizeAreas(readJson(SITEDATA_KEYS.areas, null, seedOnly));
export const setAreas = (v) => writeJson(SITEDATA_KEYS.areas, v);
/* ===================================================================
   CARTOGRAFIAS — multi (admin gerencia N cartografias, cada uma com slug)
   - Cartografia "home" é a padrão (substitui o singular antigo)
   - source: 'manual' | 'blog' | 'glossario' (nodes/edges são auto-gerados quando != 'manual')
   - layout: 'manual' (posições x/y fixas) | 'force' (d3-force calcula)
   - Retrocompat: getCartoNodes/setCartoNodes etc. continuam funcionando
     lendo/escrevendo a cartografia 'home'
=================================================================== */

export const DEFAULT_CARTOGRAPHIES = [
  {
    id: 'home',
    name: 'Cartografia (home)',
    slug: 'home',
    source: 'manual',
    layout: 'manual',
    title: 'Conceitos',
    titleEmphasis: 'junguianos',
    description: 'Um mapa vivo dos conceitos junguianos. Passe o mouse sobre cada nó para ler o axioma, e veja como as ideias se conectam.',
    viewBox: { w: 800, h: 520 },
    nodes: DEFAULT_CARTO_NODES,
    edges: DEFAULT_CARTO_EDGES,
  },
];

function normalizeCartography(c, i = 0) {
  const slug = c?.slug || c?.id || `carto-${i}`;
  return {
    id: c?.id || slug,
    slug,
    name: c?.name || 'Cartografia',
    source: ['manual', 'blog', 'glossario'].includes(c?.source) ? c.source : 'manual',
    layout: ['manual', 'force', 'radial'].includes(c?.layout) ? c.layout : 'manual',
    title: c?.title || '',
    titleEmphasis: c?.titleEmphasis || '',
    description: c?.description || '',
    viewBox: c?.viewBox || { w: 800, h: 520 },
    nodes: Array.isArray(c?.nodes) ? c.nodes : [],
    edges: Array.isArray(c?.edges) ? c.edges : [],
  };
}

export function getCartographies(seedOnly) {
  // Tenta ler a estrutura nova primeiro
  const stored = readJson(SITEDATA_KEYS.cartographies, null, seedOnly);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.map(normalizeCartography);
  }
  // Migração: lê do singular antigo e retorna como cartografia 'home'
  const oldNodes = readJson(SITEDATA_KEYS.cartoNodes, null, seedOnly);
  const oldEdges = readJson(SITEDATA_KEYS.cartoEdges, null, seedOnly);
  if (oldNodes || oldEdges) {
    return [{
      ...DEFAULT_CARTOGRAPHIES[0],
      nodes: Array.isArray(oldNodes) ? oldNodes : DEFAULT_CARTO_NODES,
      edges: Array.isArray(oldEdges) ? oldEdges : DEFAULT_CARTO_EDGES,
    }];
  }
  return DEFAULT_CARTOGRAPHIES;
}
export const setCartographies = (v) => writeJson(SITEDATA_KEYS.cartographies, v);

export function getCartographyBySlug(slug) {
  return getCartographies().find((c) => c.slug === slug) || null;
}

/* Facade pra retrocompat — operam na cartografia 'home' */
export const getCartoNodes = () => {
  const home = getCartographyBySlug('home');
  return home?.nodes || DEFAULT_CARTO_NODES;
};
export const setCartoNodes = (v) => {
  const list = getCartographies();
  const idx = list.findIndex((c) => c.slug === 'home');
  if (idx < 0) {
    setCartographies([{ ...DEFAULT_CARTOGRAPHIES[0], nodes: v }, ...list]);
  } else {
    list[idx] = { ...list[idx], nodes: v };
    setCartographies(list);
  }
};
export const getCartoEdges = () => {
  const home = getCartographyBySlug('home');
  return home?.edges || DEFAULT_CARTO_EDGES;
};
export const setCartoEdges = (v) => {
  const list = getCartographies();
  const idx = list.findIndex((c) => c.slug === 'home');
  if (idx < 0) {
    setCartographies([{ ...DEFAULT_CARTOGRAPHIES[0], edges: v }, ...list]);
  } else {
    list[idx] = { ...list[idx], edges: v };
    setCartographies(list);
  }
};
export const getHomepage = (seedOnly) => {
  // Merge por seção: campos novos do default aparecem mesmo se o admin
  // salvou antes de existirem.
  const stored = readJson(SITEDATA_KEYS.homepage, null, seedOnly);
  if (!stored) return DEFAULT_HOMEPAGE;
  return {
    ...stored,
    hero: { ...DEFAULT_HOMEPAGE.hero, ...(stored.hero || {}) },
    about: { ...DEFAULT_HOMEPAGE.about, ...(stored.about || {}) },
    newsletter: { ...DEFAULT_HOMEPAGE.newsletter, ...(stored.newsletter || {}) },
    contact: { ...DEFAULT_HOMEPAGE.contact, ...(stored.contact || {}) },
  };
};
export const setHomepage = (v) => writeJson(SITEDATA_KEYS.homepage, v);

export const getBio = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.bio, null, seedOnly);
  if (!stored) return DEFAULT_BIO;
  const links = Array.isArray(stored.links) ? stored.links : DEFAULT_BIO.links;
  const images = Array.isArray(stored.images) ? stored.images : DEFAULT_BIO.images;
  // author é merge por campo (1 nível), não spread raso: um snapshot salvo
  // antes de existir `photo`/`disclaimer` não pode fazer esses campos sumir.
  const storedAuthor = stored.author && typeof stored.author === 'object' ? stored.author : {};
  return {
    ...DEFAULT_BIO,
    ...stored,
    author: {
      ...DEFAULT_BIO.author,
      ...storedAuthor,
      photo: { ...DEFAULT_BIO.author.photo, ...(storedAuthor.photo || {}) },
    },
    images: images.map((img) => ({
      url: img.url ?? '',
      alt: img.alt ?? '',
      hidden: img.hidden ?? false,
    })),
    links: links.map((l) => ({
      label: l.label ?? '',
      href: l.href ?? '',
      image: l.image ?? '',
      icon: l.icon ?? '',
      accent: l.accent ?? '',
      description: l.description ?? '',
      hidden: l.hidden ?? false,
    })),
  };
};
export const setBio = (v) => writeJson(SITEDATA_KEYS.bio, v);

/* ===================================================================
   BLOG · CAIXA DE AUTOR — foto + bio (herdados de getBio()) + CTA
   pro fim de cada post. Só o CTA é próprio daqui; foto/nome/bio vêm
   do Bio pra não duplicar edição em dois lugares.
=================================================================== */

export const DEFAULT_BLOG_AUTHOR_CTA = {
  label: 'Receber as Cartas da Raposa',
  href: '/newsletter',
};

export const getBlogAuthorCta = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.blogAuthorCta, null, seedOnly);
  if (!stored) return DEFAULT_BLOG_AUTHOR_CTA;
  return { ...DEFAULT_BLOG_AUTHOR_CTA, ...stored };
};
export const setBlogAuthorCta = (v) => writeJson(SITEDATA_KEYS.blogAuthorCta, v);

/* ===================================================================
   VISIBILITY — controla o que aparece no site público
   (por módulo: blog, cursos, materiais, trilhas, etc)
=================================================================== */

export const DEFAULT_VISIBILITY = {
  // Páginas (some a página, o link do menu e a seção da home)
  home:       true,
  blog:       true,
  glossario:  true,  // /verbetes
  estudos:    true,  // /trilhas
  servicos:   true,  // /servicos (pesquisa sob encomenda)
  loja:       true,  // /loja
  newsletter: true,  // /newsletter e os formulários de inscrição
  bio:        true,
  materiais:  false, // módulo antigo do Psiangelo, dormindo
  cartografia: false,
  // Seções da home
  ensaioDestaque: true,
  verbetesHome:   true,
  servicosHome:   true,
  lojaHome:       true,
  about:          true,
  contato:        true,
  // Blog
  autor:          true,  // faixa "quem escreve" no fim da lista de ensaios e das trilhas
  blogAuthorBox:  true,  // caixa de autor no fim de cada ensaio
  autorInstagram: true,
  // Extras
  whatsappFlutuante: true,
  bichoNaBorda:      true,  // a raposa espiando pela borda das páginas
};

/* ===================================================================
   HOME SECTIONS ORDER — ordem vertical das seções da página inicial
=================================================================== */

/**
 * Ordem da home (2026-07-30).
 *
 * Quem chega sabe primeiro quem é o Ângelo, depois lê, depois estuda:
 * hero → sobre → ensaio em destaque → grade de ensaios → trilhas → assinar.
 *
 * A faixa "quem escreve" saiu daqui e passou a viver no fim da listagem do
 * blog: na home ela repetia o retrato do hero e a bio do "sobre".
 *
 * 2026-07-30: reposicionamento "blog com um autor" — hero, sobre e bússola
 * trocam o eixo clínico pelo eixo de estudo/escrita; entra a seção de
 * inscrição por e-mail logo depois de trilhas, onde o leitor já viu prova
 * de valor (ensaios + trilha) antes de ser convidado a assinar.
 */
export const HOME_SECTION_META = [
  { id: 'hero',          label: 'Abertura (a floresta)',             fixed: true  },
  { id: 'featuredEssay', label: 'Ensaio em destaque',                visKey: 'ensaioDestaque' },
  { id: 'blog',          label: 'Últimos ensaios',                   visKey: 'blog' },
  { id: 'verbetes',      label: 'Verbetes (as máscaras)',            visKey: 'verbetesHome' },
  { id: 'estudos',       label: 'Trilhas (o caminho de torii)',      visKey: 'estudos' },
  { id: 'servicos',      label: 'Pesquisa sob encomenda',            visKey: 'servicosHome' },
  { id: 'newsletter',    label: 'Cartas da Raposa (inscrição)',      visKey: 'newsletter' },
  { id: 'loja',          label: 'Loja (vitrine)',                    visKey: 'lojaHome' },
  { id: 'about',         label: 'Quem escreve',                      visKey: 'about' },
  { id: 'contato',       label: 'Converse comigo',                   visKey: 'contato' },
  { id: 'cartografia',   label: 'Cartografia de conceitos',          visKey: 'cartografia' },
];

/**
 * Versão do layout da home. A ordem das seções é conteúdo (o admin salva a
 * dele), mas uma repaginada muda o *desenho*, não a preferência — quando esta
 * constante sobe, a ordem salva antes da repaginada é descartada uma vez e o
 * novo default entra. O que o admin salvar depois disso é preservado.
 */
export const HOME_LAYOUT_VERSION = 1;

export const DEFAULT_HOME_SECTIONS = HOME_SECTION_META.map((s) => s.id);

export const getHomeSections = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.homeSections, null, seedOnly);
  if (!Array.isArray(stored)) return DEFAULT_HOME_SECTIONS;

  // Ordem salva antes desta repaginada: descarta uma vez e adota o novo default
  const savedLayout = Number(readJson(SITEDATA_KEYS.homeSectionsLayout, 0, seedOnly)) || 0;
  if (savedLayout < HOME_LAYOUT_VERSION) return DEFAULT_HOME_SECTIONS;

  // Valida + deduplica (user pode ter salvo ordem corrompida com duplicatas)
  const seen = new Set();
  const valid = [];
  for (const id of stored) {
    if (DEFAULT_HOME_SECTIONS.includes(id) && !seen.has(id)) {
      valid.push(id);
      seen.add(id);
    }
  }
  // Insere seções novas do default na posição relativa correta (e não no final),
  // pra que adições futuras (ex.: bussola em 2026-05-03) entrem onde fazem
  // sentido editorialmente, sem bagunçar a ordem que o admin já salvou.
  DEFAULT_HOME_SECTIONS.forEach((id, defaultIdx) => {
    if (seen.has(id)) return;
    // próxima seção do default que JÁ está em valid → ancora a inserção antes dela
    let insertAt = valid.length;
    for (let j = defaultIdx + 1; j < DEFAULT_HOME_SECTIONS.length; j++) {
      const nextId = DEFAULT_HOME_SECTIONS[j];
      const k = valid.indexOf(nextId);
      if (k !== -1) { insertAt = k; break; }
    }
    valid.splice(insertAt, 0, id);
    seen.add(id);
  });
  return valid;
};
export const setHomeSections = (v) => {
  writeJson(SITEDATA_KEYS.homeSections, v);
  // Carimba o layout atual: a partir daqui a ordem do admin manda de novo
  writeJson(SITEDATA_KEYS.homeSectionsLayout, HOME_LAYOUT_VERSION);
};

export const getSiteVisibility = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.visibility, null, seedOnly);
  if (!stored) return DEFAULT_VISIBILITY;
  return { ...DEFAULT_VISIBILITY, ...stored };
};
export const setSiteVisibility = (v) => writeJson(SITEDATA_KEYS.visibility, v);

/** É visível? Safe em SSR — getSiteVisibility() já cai no snapshot sem window. */
export const isVisible = (key) => getSiteVisibility()[key] ?? true;

/* ===================================================================
   MATERIALS · COMING SOON
=================================================================== */

export const getMaterials  = (seedOnly) => readJson(SITEDATA_KEYS.materials,  MATERIALS_DEFAULT, seedOnly);
export const setMaterials  = (v) => writeJson(SITEDATA_KEYS.materials, v);
export const getComingSoon = (seedOnly) => readJson(SITEDATA_KEYS.comingSoon, COMING_SOON_DEFAULT, seedOnly);
export const setComingSoon = (v) => writeJson(SITEDATA_KEYS.comingSoon, v);

/* ===================================================================
   MATERIAIS · CATEGORIAS · TIPOS · PÁGINA
   - Categorias e tipos de conteúdo são listas gerenciáveis pelo admin
   - Defaults reproduzem o estado pré-2026-05-18 (livro/tema, resumo-mapa/resumo/mapa)
   - Página /materiais ganha textos editáveis (hero, explanation, catalog)
=================================================================== */

export const DEFAULT_CATEGORIES = [
  { slug: 'livro', label: 'Livros', singular: 'Livro', displayMode: 'full',    ordem: 0 },
  { slug: 'tema',  label: 'Temas',  singular: 'Tema',  displayMode: 'compact', ordem: 1 },
];

export const DEFAULT_CONTENT_TYPES = [
  { slug: 'resumo-mapa', label: 'Resumo + Mapa Mental', color: '#2E5240', ordem: 0 },
  { slug: 'resumo',      label: 'Apenas Resumo',         color: '#2C3A35', ordem: 1 },
  { slug: 'mapa',        label: 'Mapa Mental',           color: '#2E5240', ordem: 2 },
];

export const DEFAULT_MATERIAIS_PAGE = {
  hero: {
    eyebrow: 'Catálogo · Resumos & Mapas Mentais',
    title: 'Materiais',
    emphasis: 'de estudo',
    kicker: 'Resumos e mapas no Obsidian',
    lead: 'Materiais que uso para estudar e ensinar — resumos, mapas e diagramas. Cada item indica seu formato.',
    primaryCtaLabel: 'Ir ao catálogo',
    primaryCtaHref: '#catalogo',
    secondaryCtaLabel: 'Ver cartografia',
    secondaryCtaHref: '/#cartografia',
  },
  explanation: {
    show: true,
    features: [
      { icon: 'graph',    title: 'Feitos no Obsidian',      body: 'Resumos interconectados com links entre conceitos.' },
      { icon: 'mindmap',  title: 'Mapas mentais completos', body: 'Diagramas detalhados — alguns bastam por si só.' },
      { icon: 'eye',      title: 'Percepção clínica',       body: 'Misturados com experiência de atendimento.' },
    ],
  },
  catalog: {
    sectionLabel: 'Catálogo',
    searchPlaceholder: 'Buscar…',
    emptyMessage: 'Nenhum material com esses filtros.',
    comingSoonLabel: 'Em breve',
    filterLabels: { category: 'Categoria', format: 'Formato', author: 'Autor', tags: 'Tags' },
  },
};

function normalizeCategories(stored) {
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_CATEGORIES;
  return stored.map((c, i) => ({
    slug: c.slug ?? `cat-${i}`,
    label: c.label ?? 'Categoria',
    singular: c.singular ?? c.label ?? 'Item',
    displayMode: c.displayMode === 'full' ? 'full' : 'compact',
    ordem: typeof c.ordem === 'number' ? c.ordem : i,
  })).sort((a, b) => a.ordem - b.ordem);
}

function normalizeContentTypes(stored) {
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_CONTENT_TYPES;
  return stored.map((t, i) => ({
    slug: t.slug ?? `tipo-${i}`,
    label: t.label ?? 'Tipo',
    color: t.color ?? '#2E5240',
    ordem: typeof t.ordem === 'number' ? t.ordem : i,
  })).sort((a, b) => a.ordem - b.ordem);
}

export const getCategories = (seedOnly) => normalizeCategories(readJson(SITEDATA_KEYS.categories, null, seedOnly));
export const setCategories = (v) => writeJson(SITEDATA_KEYS.categories, v);

export const getContentTypes = (seedOnly) => normalizeContentTypes(readJson(SITEDATA_KEYS.contentTypes, null, seedOnly));
export const setContentTypes = (v) => writeJson(SITEDATA_KEYS.contentTypes, v);

export const getMateriaisPage = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.materiaisPage, null, seedOnly);
  if (!stored) return DEFAULT_MATERIAIS_PAGE;
  const hero = { ...DEFAULT_MATERIAIS_PAGE.hero, ...(stored.hero || {}) };
  const explanation = {
    ...DEFAULT_MATERIAIS_PAGE.explanation,
    ...(stored.explanation || {}),
    features: Array.isArray(stored.explanation?.features) && stored.explanation.features.length
      ? stored.explanation.features
      : DEFAULT_MATERIAIS_PAGE.explanation.features,
  };
  const catalog = {
    ...DEFAULT_MATERIAIS_PAGE.catalog,
    ...(stored.catalog || {}),
    filterLabels: { ...DEFAULT_MATERIAIS_PAGE.catalog.filterLabels, ...(stored.catalog?.filterLabels || {}) },
  };
  return { hero, explanation, catalog };
};
export const setMateriaisPage = (v) => writeJson(SITEDATA_KEYS.materiaisPage, v);

/* ===================================================================
   TESTIMONIALS · FAQS
=================================================================== */

export const DEFAULT_TESTIMONIALS = [
  {
    id: 'test-1',
    quote: 'Os resumos de Jung são incrivelmente didáticos. Consegui finalmente entender conceitos que me travavam há semestres. Material indispensável para qualquer estudante sério de psicologia analítica.',
    name: 'Mariana S.',
    role: 'Estudante de Psicologia',
    audience: 'estudantes',
    archetype: 'Persona',
  },
  {
    id: 'test-2',
    quote: 'Estava perdida no meio de tanta bibliografia para o TCC e esses materiais me deram uma direção clara. A síntese é precisa sem perder a profundidade. Me salvou muito tempo de estudo.',
    name: 'Letícia A.',
    role: 'Estudante de Psicologia',
    audience: 'estudantes',
    archetype: 'Anima',
  },
  {
    id: 'test-3',
    quote: 'Uso os materiais do Ângelo como apoio na minha prática clínica. A forma como ele organiza os conceitos facilita demais a revisão antes das sessões. Recomendo para todos os colegas.',
    name: 'Rafael M.',
    role: 'Psicólogo Clínico',
    audience: 'clinicos',
    archetype: 'Self',
  },
  {
    id: 'test-4',
    quote: 'Procurei por muito tempo um material que fosse ao mesmo tempo aprofundado e acessível. Encontrei nos resumos dele exatamente isso. A qualidade é de outro nível.',
    name: 'Camila R.',
    role: 'Psicanalista',
    audience: 'clinicos',
    archetype: 'Sombra',
  },
  {
    id: 'test-5',
    quote: 'Como supervisor de estágio, indico os materiais do Ângelo para os estagiários. A clareza conceitual e a organização são exemplares. Um trabalho sério e cuidadoso.',
    name: 'Dr. Fernando L.',
    role: 'Professor de Psicologia',
    audience: 'professores',
    archetype: 'Self',
  },
];

export const getTestimonials = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.testimonials, null, seedOnly);
  if (!stored || !Array.isArray(stored) || stored.length === 0) return DEFAULT_TESTIMONIALS;
  return stored.map((t) => ({
    // hidrata campos faltando com defaults razoáveis
    audience: 'todos',
    archetype: 'Self',
    ...t,
  }));
};
export const setTestimonials = (v) => writeJson(SITEDATA_KEYS.testimonials, v);

export const DEFAULT_FAQS = [
  { id: 'faq-clin-1', group: 'Clínica', question: 'Como é a primeira conversa?',
    answer: 'É uma conversa curta, sem compromisso. Serve para você me conhecer, me contar o que traz e avaliarmos juntos se faz sentido seguir. Marcamos pelo WhatsApp.' },
  { id: 'faq-clin-2', group: 'Clínica', question: 'Você atende online em todo o Brasil?',
    answer: 'Sim. Todo o atendimento é online, por videochamada — basta uma conexão estável e um lugar tranquilo. Atendo pessoas em qualquer estado do Brasil e brasileiros vivendo no exterior, em português.' },
  { id: 'faq-clin-3', group: 'Clínica', question: 'Para quais públicos você atende?',
    answer: 'Adolescentes a partir de 14 anos (com consentimento dos responsáveis), adultos e idosos. Cada faixa etária tem suas particularidades clínicas e o trabalho é ajustado a quem chega.' },
  { id: 'faq-clin-4', group: 'Clínica', question: 'Quanto tempo dura um processo de psicoterapia?',
    answer: 'Depende do momento e do que aparece no trabalho. Pode ser meses, pode ser anos. O tempo é acompanhado, não prescrito — não há promessa de prazo.' },
  { id: 'faq-abor-1', group: 'Abordagem', question: 'O que é psicoterapia analítica?',
    answer: 'Também conhecida como psicologia analítica ou abordagem junguiana, é a prática clínica desenvolvida a partir do trabalho de Carl Gustav Jung. Trabalha com símbolos, sonhos, complexos e o processo de individuação — o caminho de tornar-se quem você é.' },
  { id: 'faq-abor-2', group: 'Abordagem', question: 'Atendimento online funciona tão bem quanto presencial?',
    answer: 'Sim. O vínculo clínico se estabelece pela palavra e pela continuidade — o essencial é a presença e o cuidado, não o espaço físico. A literatura clínica recente é consistente em demonstrar a eficácia da psicoterapia online para a maioria das demandas.' },
  { id: 'faq-abor-3', group: 'Abordagem', question: 'Vocês fazem análise de sonhos?',
    answer: 'Sim, quando faz sentido. A análise de sonhos é uma das ferramentas centrais da psicologia analítica — não como decifração de manuais, mas como escuta cuidadosa do que o inconsciente está dizendo na sua linguagem própria.' },
  { id: 'faq-etic-1', group: 'Ética e sigilo', question: 'Como funciona o sigilo?',
    answer: 'Absoluto, conforme o Código de Ética da profissão. Nada do que você trouxer sai daqui. No atendimento de adolescente, o sigilo também é resguardado — converso com a família apenas o necessário e sempre com transparência prévia.' },
  { id: 'faq-etic-2', group: 'Ética e sigilo', question: 'Você é psicólogo formado?',
    answer: 'Ainda não. Atendo como estagiário de psicologia em estágio clínico supervisionado pela Associação Allos. Ao concluir a graduação e obter registro no CRP, esta indicação será atualizada.' },
];

export const getFaqs = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.faqs, null, seedOnly);
  if (!stored || !Array.isArray(stored) || stored.length === 0) return DEFAULT_FAQS;
  return stored;
};
export const setFaqs = (v) => writeJson(SITEDATA_KEYS.faqs, v);

/* ===================================================================
   SETTINGS — canais de contato e metadados editáveis
=================================================================== */

export const DEFAULT_SETTINGS = {
  whatsappNumber: '5581987349114',
  whatsappMessage: 'Oi! Vim pelo site da Raposa Analítica.',
  instagramLink: 'https://www.instagram.com/raposaanalitica/',
  youtubeLink: '',
  emailAddress: '',
  siteTitle: 'Raposa Analítica',
  siteDescription: 'Ensaios, verbetes e trilhas de leitura sobre a obra de Carl Gustav Jung, com a referência de cada coisa.',
  accentColor: '#2E5240',
};

export const getSettings = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.settings, null, seedOnly);
  if (!stored) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...stored };
};
export const setSettings = (v) => writeJson(SITEDATA_KEYS.settings, v);

/* ===================================================================
   GLOSSÁRIO — verbetes, categorias e textos da página /verbetes
   Defaults: importados de src/data/glossario.js (mantém SSG do build)
=================================================================== */

import { glossario as GLOSSARIO_DEFAULT, CATEGORIES as GLOSSARIO_CATEGORIES_DEFAULT } from '@/data/glossario';

// Categorias do glossário viram lista gerenciável (label + slug + ordem)
/* A máscara de kitsune de cada categoria, pela cor com sentido do banco:
   shiro persona · kuro sombra · aka afeto · ai inconsciente · kin si-mesmo ·
   koke instinto · fuji sonho e anima · sakura efêmero. */
export const MASCARAS = [
  { id: 'shiro', nome: 'Shiro (branca)', sentido: 'persona', cor: '#F3E9D7', fundo: '#B9C9B4' },
  { id: 'kuro', nome: 'Kuro (negra)', sentido: 'sombra', cor: '#13211F', fundo: '#DCE4DA' },
  { id: 'aka', nome: 'Aka (vermelha)', sentido: 'afeto', cor: '#CF432F', fundo: '#F2D9CF' },
  { id: 'ai', nome: 'Ai (anil)', sentido: 'inconsciente', cor: '#2E4C7A', fundo: '#D7DFEC' },
  { id: 'kin', nome: 'Kin (dourada)', sentido: 'si-mesmo', cor: '#D7A441', fundo: '#DCE4DA' },
  { id: 'koke', nome: 'Koke (musgo)', sentido: 'instinto', cor: '#5C7D4E', fundo: '#E6EBD6' },
  { id: 'fuji', nome: 'Fuji (glicínia)', sentido: 'sonho e anima', cor: '#9B89C2', fundo: '#E7E1F1' },
  { id: 'sakura', nome: 'Sakura', sentido: 'o efêmero', cor: '#EDB7AC', fundo: '#F6E6E1' },
];
const MASCARA_POR_CATEGORIA = { estrutura: 'ai', arquetipos: 'fuji', dinamica: 'aka', processo: 'kin', alquimia: 'kuro', clinica: 'shiro' };
export const mascaraInfo = (id) => MASCARAS.find((m) => m.id === id) || MASCARAS[0];

export const DEFAULT_GLOSSARIO_CATEGORIES = Object.entries(GLOSSARIO_CATEGORIES_DEFAULT).map(([slug, info], i) => ({
  slug,
  label: info.label,
  tone: info.tone,
  mascara: MASCARA_POR_CATEGORIA[slug] || 'shiro',
  ordem: i,
}));

function normalizeGlossarioCategories(stored) {
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_GLOSSARIO_CATEGORIES;
  return stored.map((c, i) => ({
    slug: c.slug ?? `cat-${i}`,
    label: c.label ?? 'Categoria',
    tone: c.tone ?? 'accent',
    mascara: c.mascara ?? MASCARA_POR_CATEGORIA[c.slug] ?? 'shiro',
    ordem: typeof c.ordem === 'number' ? c.ordem : i,
  })).sort((a, b) => a.ordem - b.ordem);
}

export const getGlossarioCategories = (seedOnly) =>
  normalizeGlossarioCategories(readJson(SITEDATA_KEYS.glossarioCategories, null, seedOnly));
export const setGlossarioCategories = (v) => writeJson(SITEDATA_KEYS.glossarioCategories, v);

// Verbete: defaults + campos novos opcionais (`links`, `hidden`, `autolink`).
function normalizeGlossario(stored) {
  const base = Array.isArray(stored) && stored.length > 0 ? stored : GLOSSARIO_DEFAULT;
  return base.map((g, i) => ({
    slug: g.slug ?? `verbete-${i}`,
    term: g.term ?? 'Verbete',
    aliases: Array.isArray(g.aliases) ? g.aliases : [],
    category: g.category ?? 'estrutura',
    mascara: g.mascara ?? '',   // máscara própria (vazio = a da categoria)
    short: g.short ?? '',
    full: g.full ?? '',
    related: {
      terms: g.related?.terms ?? [],
      materials: g.related?.materials ?? [],
    },
    links: Array.isArray(g.links) ? g.links : [],  // [{kind, value, label}]
    hidden: !!g.hidden,
    // autolink: liga/desliga o autolink automático deste verbete nos ensaios
    // (BlogPostView → linkGlossaryTerms → buildGlossaryEntries). Default true
    // para não mudar o comportamento de nenhum verbete já cadastrado — só
    // objetos que gravarem `autolink: false` explicitamente saem do autolink.
    // A marcação manual (applyManualTerms) NUNCA consulta esta flag: mesmo
    // com autolink desligado, marcar o trecho à mão continua funcionando —
    // é justamente o caso de uso (ex.: "eu" desligado do automático, mas
    // marcado à mão nos trechos em que de fato significa o Ego).
    autolink: g.autolink !== false,
    ordem: typeof g.ordem === 'number' ? g.ordem : i,
  }));
}

export const getGlossario = (seedOnly) => normalizeGlossario(readJson(SITEDATA_KEYS.glossario, null, seedOnly));
export const setGlossario = (v) => writeJson(SITEDATA_KEYS.glossario, v);

// Textos da página /verbetes (hero + intro)
export const DEFAULT_GLOSSARIO_PAGE = {
  hero: {
    eyebrow: 'Vocabulário · Psicologia Analítica',
    title: 'Glossário',
    emphasis: 'junguiano',
    kicker: 'Conceitos essenciais, interligados',
    lead: 'Termos fundamentais — Self, Sombra, Individuação, Arquétipo, Sincronicidade — com definições claras e links entre ideias.',
  },
  empty: {
    sectionLabel: 'Categorias',
    emptyMessage: 'Nenhum verbete ainda.',
  },
};

export const getGlossarioPage = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.glossarioPage, null, seedOnly);
  if (!stored) return DEFAULT_GLOSSARIO_PAGE;
  return {
    hero: { ...DEFAULT_GLOSSARIO_PAGE.hero, ...(stored.hero || {}) },
    empty: { ...DEFAULT_GLOSSARIO_PAGE.empty, ...(stored.empty || {}) },
  };
};
export const setGlossarioPage = (v) => writeJson(SITEDATA_KEYS.glossarioPage, v);

/* ===================================================================
   /ESTUDOS — hub editorial (segunda home para quem quer estudar)
   Estrutura por blocos reordenáveis, com seleção de conteúdo por bloco.
=================================================================== */

export const ESTUDOS_BLOCK_TYPES = [
  { id: 'hero',        label: 'Hero (topo)' },
  { id: 'trilhas',     label: 'Trilhas em destaque' },
  { id: 'glossario',   label: 'Glossário em destaque' },
  { id: 'materiais',   label: 'Materiais recomendados' },
  { id: 'cursos',      label: 'Cursos recomendados' },
  { id: 'blog',        label: 'Posts do blog selecionados' },
  { id: 'cartografia', label: 'Cartografia de conceitos' },
  { id: 'manifesto',   label: 'Bússola de estudos (texto livre)' },
];

export const DEFAULT_ESTUDOS_PAGE = {
  hero: {
    eyebrow: 'Sala de estudos',
    title: 'Estudos',
    emphasis: 'em psicologia analítica',
    kicker: 'Por onde começar, o que ler, em que ordem',
    lead: 'Curadoria do que publico aqui — trilhas, verbetes, materiais e ensaios — pensada para quem está chegando ou para quem quer aprofundar.',
    primaryCtaLabel: 'Começar uma trilha',
    primaryCtaHref: '#trilhas',
    secondaryCtaLabel: 'Ver glossário',
    secondaryCtaHref: '/verbetes',
  },
  blocks: [
    { id: 'hero',      visible: true,  config: {} },
    { id: 'manifesto', visible: false, config: { title: 'Como estudar Jung', body: '' } },
    { id: 'trilhas',   visible: true,  config: { title: 'Trilhas', subtitle: 'Sequências curadas — por onde começar.', selected: [] } },
    { id: 'glossario', visible: true,  config: { title: 'Glossário em foco', subtitle: 'Verbetes-chave para começar.', selected: [], limit: 8 } },
    { id: 'materiais', visible: true,  config: { title: 'Materiais', subtitle: 'Resumos, mapas e ensaios.', selected: [], limit: 6 } },
    { id: 'cursos',    visible: false, config: { title: 'Cursos', subtitle: 'Formação aprofundada.', selected: [] } },
    { id: 'blog',      visible: true,  config: { title: 'Ensaios', subtitle: 'Textos sobre clínica e símbolos.', selected: [], limit: 4 } },
    { id: 'cartografia', visible: false, config: { title: 'Cartografia', subtitle: 'Mapa dos conceitos centrais e suas conexões.', source: 'home' } },
  ],
};

function normalizeEstudosPage(stored) {
  if (!stored) return DEFAULT_ESTUDOS_PAGE;
  const hero = { ...DEFAULT_ESTUDOS_PAGE.hero, ...(stored.hero || {}) };
  const knownIds = new Set(ESTUDOS_BLOCK_TYPES.map((b) => b.id));
  const storedBlocks = Array.isArray(stored.blocks) ? stored.blocks : [];
  const seen = new Set();
  const blocks = [];
  // 1) preserva ordem do admin
  for (const b of storedBlocks) {
    if (!b?.id || !knownIds.has(b.id) || seen.has(b.id)) continue;
    seen.add(b.id);
    const def = DEFAULT_ESTUDOS_PAGE.blocks.find((d) => d.id === b.id);
    blocks.push({
      id: b.id,
      visible: typeof b.visible === 'boolean' ? b.visible : (def?.visible ?? true),
      config: { ...(def?.config || {}), ...(b.config || {}) },
    });
  }
  // 2) adiciona blocos novos do default que ainda não estavam salvos
  for (const def of DEFAULT_ESTUDOS_PAGE.blocks) {
    if (seen.has(def.id)) continue;
    blocks.push({ ...def });
  }
  return { hero, blocks };
}

export const getEstudosPage = (seedOnly) => normalizeEstudosPage(readJson(SITEDATA_KEYS.estudosPage, null, seedOnly));
export const setEstudosPage = (v) => writeJson(SITEDATA_KEYS.estudosPage, v);

/* ===================================================================
   LABELS — textos customizáveis da navbar e dos títulos das seções da home.
   Quando vazio (string em branco), o componente cai pro default hardcoded.
=================================================================== */

export const DEFAULT_NAV_LABELS = {
  home:       'Início',
  blog:       'Ensaios',
  glossario:  'Verbetes',
  estudos:    'Trilhas',
  servicos:   'Pesquisa',
  loja:       'Loja',
  newsletter: 'Cartas',
  about:      'Sobre',
};

// Títulos editoriais das seções da home — cada chave é um id de seção
// (ver HOME_SECTION_META). Valores em branco = usa default do componente.
export const DEFAULT_SECTION_LABELS = {
  featuredEssay: '',
  blog:       '',
  verbetes:   '',
  estudos:    '',
  servicos:   '',
  newsletter: '',
  loja:       '',
  about:      '',
  contato:    '',
};

export const DEFAULT_LABELS = {
  nav:      DEFAULT_NAV_LABELS,
  sections: DEFAULT_SECTION_LABELS,
};

export const getLabels = (seedOnly) => {
  const stored = readJson(SITEDATA_KEYS.labels, null, seedOnly);
  if (!stored) return DEFAULT_LABELS;
  return {
    nav:      { ...DEFAULT_NAV_LABELS,     ...(stored.nav || {}) },
    sections: { ...DEFAULT_SECTION_LABELS, ...(stored.sections || {}) },
  };
};
export const setLabels = (v) => writeJson(SITEDATA_KEYS.labels, v);

/* ===================================================================
   SERVIÇOS — pesquisa sob encomenda (plano de negócio, §4.5)
=================================================================== */

export const DEFAULT_SERVICOS = {
  hero: { eyebrow: 'Pesquisa sob encomenda', title: 'A raposa vai', emphasis: 'pescar na obra', lead: '', primaryLabel: 'Pedir um orçamento' },
  pecas: [],
  passos: [],
  limites: [],
  cta: { titulo: 'Tem uma pergunta para a raposa?', texto: '', whatsappMensagem: 'Oi! Queria um orçamento de pesquisa. Tema: ', email: '' },
  ...(SEED.raposa_admin_servicos || {}),
};

export const getServicos = (seedOnly) => {
  const s = readJson(SITEDATA_KEYS.servicos, null, seedOnly);
  if (!s) return DEFAULT_SERVICOS;
  return {
    ...DEFAULT_SERVICOS,
    ...s,
    hero: { ...DEFAULT_SERVICOS.hero, ...(s.hero || {}) },
    cta: { ...DEFAULT_SERVICOS.cta, ...(s.cta || {}) },
    pecas: Array.isArray(s.pecas) ? s.pecas.map((p, i) => ({
      id: p.id || `peca-${i}`, nome: p.nome ?? '', pergunta: p.pergunta ?? '', descricao: p.descricao ?? '',
      entrega: p.entrega ?? '', prazo: p.prazo ?? '', preco: p.preco ?? '', icone: p.icone ?? 'lupa',
      destaque: !!p.destaque, oculto: !!p.oculto,
    })) : DEFAULT_SERVICOS.pecas,
    passos: Array.isArray(s.passos) ? s.passos : DEFAULT_SERVICOS.passos,
    limites: Array.isArray(s.limites) ? s.limites : DEFAULT_SERVICOS.limites,
  };
};
export const setServicos = (v) => writeJson(SITEDATA_KEYS.servicos, v);

/* ===================================================================
   LOJA — produtos (guias, leituras comentadas, cotejos, objetos)
   A venda acontece fora (Hotmart, Kiwify, Mercado Pago, Gumroad...):
   cada produto guarda o link do checkout. Status: rascunho (não aparece),
   em-breve (aparece com «avise-me»), a-venda (botão de compra).
=================================================================== */

export const LOJA_STATUS = [
  { id: 'rascunho', label: 'Rascunho (oculto)' },
  { id: 'em-breve', label: 'Em breve' },
  { id: 'a-venda', label: 'À venda' },
];

export const DEFAULT_LOJA = {
  hero: { eyebrow: 'Loja', title: 'Materiais para', emphasis: 'estudar Jung', lead: '' },
  avisoSemProdutos: '',
  linhas: [],
  produtos: [],
  ...(SEED.raposa_admin_loja || {}),
};

export const getLoja = (seedOnly) => {
  const s = readJson(SITEDATA_KEYS.loja, null, seedOnly);
  if (!s) return DEFAULT_LOJA;
  return {
    ...DEFAULT_LOJA,
    ...s,
    hero: { ...DEFAULT_LOJA.hero, ...(s.hero || {}) },
    linhas: Array.isArray(s.linhas) ? s.linhas : DEFAULT_LOJA.linhas,
    produtos: Array.isArray(s.produtos) ? s.produtos.map((p, i) => ({
      id: p.id || `produto-${i}`, linha: p.linha ?? '', titulo: p.titulo ?? '', subtitulo: p.subtitulo ?? '',
      descricao: p.descricao ?? '', preco: p.preco ?? '', precoAntigo: p.precoAntigo ?? '', link: p.link ?? '',
      status: p.status ?? 'em-breve', capa: p.capa ?? '', figura: p.figura ?? '', formato: p.formato ?? '',
      paginas: p.paginas ?? '', amostra: p.amostra ?? '', destaque: !!p.destaque,
    })) : DEFAULT_LOJA.produtos,
  };
};
export const setLoja = (v) => writeJson(SITEDATA_KEYS.loja, v);

/* ===================================================================
   NEWSLETTER — Cartas da Raposa
   O site é estático: a inscrição vai para um serviço de e-mail escolhido
   no painel. 'buttondown' e 'formulario' (ação de qualquer formulário:
   MailerLite, Kit, Brevo, Google Forms...) recebem o e-mail sem sair da
   página; 'substack' abre a página de inscrição do Substack.
=================================================================== */

export const NEWSLETTER_PROVEDORES = [
  { id: 'nenhum', label: 'Ainda não escolhido (o formulário avisa que as cartas começam em breve)' },
  { id: 'buttondown', label: 'Buttondown' },
  { id: 'substack', label: 'Substack' },
  { id: 'formulario', label: 'Outro (MailerLite, Kit, Brevo, Google Forms…): endereço do formulário' },
];

export const DEFAULT_NEWSLETTER = {
  nome: 'Cartas da Raposa',
  provedor: 'nenhum',
  buttondownUsuario: '',
  substackEndereco: '',
  formularioAcao: '',
  formularioCampoEmail: 'email',
  pagina: { eyebrow: 'Newsletter', title: 'Cartas da', emphasis: 'Raposa', lead: '', itens: [] },
  ...(SEED.raposa_admin_newsletter || {}),
};

export const getNewsletterConfig = (seedOnly) => {
  const s = readJson(SITEDATA_KEYS.newsletter, null, seedOnly);
  if (!s) return DEFAULT_NEWSLETTER;
  return { ...DEFAULT_NEWSLETTER, ...s, pagina: { ...DEFAULT_NEWSLETTER.pagina, ...(s.pagina || {}) } };
};
export const setNewsletterConfig = (v) => writeJson(SITEDATA_KEYS.newsletter, v);

/* ===================================================================
   ESTILO DAS TAGS — padronagem e cor de cada tag do blog
   { "<tag em minúsculas>": { padrao: 'seigaiha', cor: '#2E5240' } }
=================================================================== */
export const getTagEstilos = (seedOnly) => {
  const s = readJson(SITEDATA_KEYS.tagEstilos, null, seedOnly);
  return s && typeof s === 'object' ? s : {};
};
export const setTagEstilos = (v) => writeJson(SITEDATA_KEYS.tagEstilos, v);

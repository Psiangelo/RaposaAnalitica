/**
 * glossaryLinker — autolink de termos do glossário dentro do HTML de um
 * ensaio, e detecção de menções (usada tanto pra gerar os links quanto pro
 * índice "ensaios que tratam deste termo" em /verbetes/[slug]).
 *
 * Propriedades importantes, todas exigidas pelo produto:
 *  - Roda sobre a STRING de HTML, em build-time/render (não em useEffect
 *    depois da hidratação) — o link precisa existir no HTML estático, pro
 *    leitor sem JS e pro Google.
 *  - Nunca usa DOM (sem `document`): precisa funcionar em Node (SSG) e no
 *    browser com o mesmo código.
 *  - Tokeniza HTML em tags vs. texto e só processa os pedaços de TEXTO —
 *    nunca mexe dentro de atributos (href, alt, src, title...) nem dentro
 *    de tags "protegidas" (a, code, pre, headings, blockquote, script,
 *    style, svg, textarea, button).
 *  - Fronteira de palavra Unicode-aware (\p{L}/\p{N}), porque o `\b` do
 *    JavaScript não entende acentos — "individuação", "psíquico" etc.
 *  - Casa por variante mais longa primeiro ("inconsciente coletivo" antes
 *    de qualquer termo mais curto que seria substring dele).
 *  - Só a PRIMEIRA ocorrência de cada termo (slug), no documento inteiro —
 *    não por parágrafo/nó de texto isolado.
 *
 * Este arquivo não depende de Next.js nem de aliases (@/...) de propósito:
 * quem chama passa `basePath` como parâmetro. Isso permite rodar os testes
 * em Node puro (scripts/test-glossary-linker.mjs) sem precisar do bundler.
 */

const SKIP_TAGS = new Set([
  'a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'script', 'style', 'svg', 'textarea', 'button',
]);

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wordRegex(variant) {
  // Fronteira de palavra Unicode-aware. `\b` do JS é ASCII-only e falha com
  // acentos (ex: casaria "ego" dentro de "egoísmo" se usássemos \b).
  return new RegExp(`(?<![\\p{L}\\p{N}_])(${escapeRegExp(variant)})(?![\\p{L}\\p{N}_])`, 'iu');
}

function tokenizeHtml(html) {
  // Split mantendo os delimitadores (tags) no array. Assume HTML bem
  // formado — o conteúdo vem do editor (Tiptap), não de input arbitrário.
  return String(html).split(/(<[^>]*>)/g);
}

function tagName(token) {
  const m = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(token);
  return m ? m[1].toLowerCase() : null;
}

function isClosingTag(token) {
  return /^<\//.test(token);
}

function isSelfClosing(token) {
  return /\/\s*>$/.test(token);
}

/**
 * Monta a lista de variantes (termo + aliases) a partir do glossário,
 * ordenada por tamanho decrescente (termos compostos primeiro).
 *
 * @param glossarioList  array no formato de src/data/glossario.js
 * @param options.excludeSlugs  slugs a não considerar (ex: o próprio termo
 *   do post, pra não autolinkar "inconsciente" dentro do ensaio que É
 *   sobre inconsciente)
 */
export function buildGlossaryEntries(glossarioList, { excludeSlugs } = {}) {
  const exclude = new Set(excludeSlugs || []);
  const entries = [];
  for (const g of glossarioList || []) {
    if (!g || !g.slug || g.hidden) continue;
    // autolink === false: dono desligou o autolink automático deste verbete
    // (continua com página própria, no índice e no sitemap — só não vira
    // link sozinho dentro de ensaios). Ausência do campo = ligado (default),
    // pra não quebrar conteúdo antigo que nunca teve essa flag.
    if (g.autolink === false) continue;
    if (exclude.has(g.slug)) continue;
    const variants = [g.term, ...(g.aliases || [])].filter((v) => typeof v === 'string' && v.trim());
    for (const variant of variants) {
      entries.push({ variant, slug: g.slug, term: g.term, short: g.short || '' });
    }
  }
  entries.sort((a, b) => b.variant.length - a.variant.length);
  return entries;
}

/**
 * Heurística: quais slugs o post NÃO deve autolinkar porque o próprio post
 * é sobre aquele termo (ex.: título "O que é inconsciente em Jung?").
 * Frágil por natureza — se não bater, deixa passar (é melhor um link a
 * mais discreto do que lógica excessivamente esperta que erra).
 */
export function slugsToExcludeForTitle(title, glossarioList) {
  if (!title) return [];
  const out = [];
  for (const g of glossarioList || []) {
    if (!g || !g.slug) continue;
    const variants = [g.term, ...(g.aliases || [])].filter((v) => typeof v === 'string' && v.trim());
    if (variants.some((v) => wordRegex(v).test(title))) out.push(g.slug);
  }
  return out;
}

/**
 * Núcleo compartilhado: percorre o HTML tag-a-tag/texto-a-texto e, pra cada
 * pedaço de texto fora de tags protegidas, encontra a primeira ocorrência
 * (ainda não vista) de cada entrada. Se `link` for true, produz o HTML com
 * <a> inseridos; sempre retorna a lista de slugs encontrados, em ordem.
 */
function walk(html, entries, { link, seed } = {}) {
  if (!html || !entries || entries.length === 0) {
    return { html: html || '', mentions: [] };
  }

  const tokens = tokenizeHtml(html);
  let skipDepth = 0;
  // `seed`: slugs já resolvidos pela marcação manual, para o autolink não
  // linkar o mesmo verbete uma segunda vez logo abaixo.
  const seen = new Set(seed || []);
  const mentions = [];
  let out = '';

  for (const token of tokens) {
    if (!token) continue;

    if (token[0] === '<') {
      const name = tagName(token);
      if (name && SKIP_TAGS.has(name) && !VOID_TAGS.has(name) && !isSelfClosing(token)) {
        if (isClosingTag(token)) {
          if (skipDepth > 0) skipDepth -= 1;
        } else {
          skipDepth += 1;
        }
      }
      if (link) out += token;
      continue;
    }

    if (skipDepth > 0 || !token.trim()) {
      if (link) out += token;
      continue;
    }

    let cursor = 0;
    let chunk = '';
    while (cursor < token.length) {
      let best = null;
      const remaining = token.slice(cursor);
      for (const entry of entries) {
        if (seen.has(entry.slug)) continue;
        const m = wordRegex(entry.variant).exec(remaining);
        if (!m) continue;
        const idx = cursor + m.index;
        if (!best || idx < best.idx) {
          best = { idx, length: m[0].length, entry, text: m[0] };
        }
      }
      if (!best) {
        chunk += token.slice(cursor);
        break;
      }
      chunk += token.slice(cursor, best.idx);
      if (link) {
        const href = `${link.basePath || ''}/verbetes/${best.entry.slug}/`;
        chunk += `<a href="${href}" class="term-link" data-term-slug="${escapeAttr(best.entry.slug)}" data-term-title="${escapeAttr(best.entry.term)}" data-term-short="${escapeAttr(best.entry.short)}">${best.text}</a>`;
      } else {
        chunk += best.text;
      }
      seen.add(best.entry.slug);
      mentions.push({ slug: best.entry.slug, term: best.entry.term });
      cursor = best.idx + best.length;
    }
    out += chunk;
  }

  return { html: link ? out : html, mentions };
}

/**
 * Detecta, sem modificar nada, quais termos aparecem (primeira ocorrência
 * de cada um, em ordem) num HTML. Usado pra montar o índice "ensaios que
 * mencionam este termo" — deliberadamente SEM a exclusão de auto-termo,
 * porque o ensaio que É sobre "Sombra" deve aparecer listado no verbete
 * Sombra mesmo que não autolinke a si mesmo.
 */
export function scanGlossaryMentions(html, entries) {
  return walk(html, entries, { link: null }).mentions.map((m) => m.slug);
}

/**
 * Autolinka a primeira ocorrência de cada termo do glossário dentro de
 * `html`. Retorna { html, linkedSlugs }.
 *
 * @param options.title      título do post, pra excluir autolink do
 *                            próprio termo (heurística best-effort)
 * @param options.basePath    prefixo de rota (ex: '/Psiangelo')
 */
/**
 * Palavras que NUNCA viram link automático, mesmo estando no glossário como
 * alias. São palavras funcionais do português: linká-las enche o texto de
 * ruído e manda o leitor para um verbete que não tem relação com a frase.
 *
 * Motivo concreto (30/07/2026): «eu» é alias de Ego, e o autolink transformou
 * um «eu» qualquer do meio de um parágrafo em link para o verbete Ego.
 *
 * Isso NÃO impede a marcação manual: se o autor marcar «eu» de propósito num
 * trecho em que a palavra de fato significa o Ego, a marca manual vale.
 */
const NUNCA_AUTOLINK = new Set([
  'eu', 'me', 'mim', 'si', 'se', 'ele', 'ela', 'nos', 'nós',
  'ser', 'sou', 'é', 'ter', 'tem', 'ver', 'ir', 'dar',
  'um', 'uma', 'the', 'de', 'da', 'do', 'em', 'no', 'na',
]);

/**
 * Resolve as marcações MANUAIS `<span data-termo="slug">texto</span>`,
 * postas pelo autor no editor, em âncoras de verbete.
 *
 * Roda ANTES do autolink e tem prioridade sobre ele: o que o autor marcou de
 * propósito vale mais que o casamento de grafia. Os slugs resolvidos aqui
 * entram em `seen`, para o autolink não linkar o mesmo verbete de novo logo
 * adiante.
 *
 * O span guarda só o slug; título e definição são lidos do glossário atual,
 * então reescrever um verbete atualiza o que aparece no card de todos os
 * posts, sem tocar no conteúdo deles.
 *
 * Slug que não existe mais (verbete renomeado ou apagado): vira texto comum,
 * sem link quebrado.
 */
export function applyManualTerms(html, glossarioList, { basePath = '' } = {}) {
  const usados = new Set();
  if (!html || typeof html !== 'string') return { html: html || '', usados };

  const porSlug = new Map();
  for (const g of glossarioList || []) {
    if (g && g.slug && !g.hidden) porSlug.set(g.slug, g);
  }

  const out = html.replace(
    /<span([^>]*?)data-termo="([^"]*)"([^>]*?)>([\s\S]*?)<\/span>/gi,
    (full, _pre, slug, _pos, texto) => {
      const verbete = porSlug.get(slug);
      if (!verbete) return texto; // verbete sumiu: devolve o texto puro
      usados.add(slug);
      const href = `${basePath || ''}/verbetes/${slug}/`;
      return (
        `<a href="${href}" class="term-link" data-term-slug="${escapeAttr(slug)}"` +
        ` data-term-title="${escapeAttr(verbete.term || slug)}"` +
        ` data-term-short="${escapeAttr(verbete.short || '')}">${texto}</a>`
      );
    },
  );

  return { html: out, usados };
}

export function linkGlossaryTerms(html, glossarioList, { title, basePath = '' } = {}) {
  // 1. o que o autor marcou à mão manda
  const manual = applyManualTerms(html, glossarioList, { basePath });

  // 2. autolink para o resto, pulando o que já foi marcado e as palavras
  //    funcionais que nunca devem virar link sozinhas
  const exclude = slugsToExcludeForTitle(title, glossarioList);
  const entries = buildGlossaryEntries(glossarioList, { excludeSlugs: exclude }).filter(
    (e) => !NUNCA_AUTOLINK.has(String(e.variant).trim().toLowerCase()),
  );

  const result = walk(manual.html, entries, { link: { basePath }, seed: manual.usados });
  return {
    html: result.html,
    linkedSlugs: [...manual.usados, ...result.mentions.map((m) => m.slug)],
  };
}

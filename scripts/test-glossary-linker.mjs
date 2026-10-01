#!/usr/bin/env node
/**
 * Testes unitários puros de src/lib/glossaryLinker.js — sem Next, sem DOM.
 * Roda com: node scripts/test-glossary-linker.mjs
 * Sai com código != 0 se qualquer caso falhar (pra travar CI/build se
 * alguém quebrar o parser).
 */
import assert from 'node:assert/strict';
import { linkGlossaryTerms, scanGlossaryMentions, buildGlossaryEntries } from '../src/lib/glossaryLinker.js';

const GLOSSARIO = [
  { slug: 'ego', term: 'Ego', aliases: ['eu'], short: 'Centro da consciência.' },
  { slug: 'persona', term: 'Persona', aliases: ['máscara'], short: 'Máscara social.' },
  { slug: 'sombra', term: 'Sombra', aliases: [], short: 'O lado rejeitado.' },
  { slug: 'anima', term: 'Anima', aliases: [], short: 'Imagem do feminino.' },
  { slug: 'individuacao', term: 'Individuação', aliases: [], short: 'Tornar-se quem se é.' },
  { slug: 'inconsciente-coletivo', term: 'Inconsciente coletivo', aliases: ['psique objetiva'], short: 'Substrato comum.' },
  { slug: 'self', term: 'Self', aliases: ['si-mesmo', 'si mesmo'], short: 'Centro regulador.' },
  { slug: 'numinoso', term: 'Numinoso', aliases: [], short: 'Sagrado, terrível, fascinante.' },
  { slug: 'complexo', term: 'Complexo', aliases: [], short: 'Núcleo afetivo autônomo.' },
];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  - ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL - ${name}`);
    console.error(`       ${err.message}`);
  }
}

function link(html, opts) {
  return linkGlossaryTerms(html, GLOSSARIO, { basePath: '/RaposaAnalitica', ...opts }).html;
}

console.log('glossaryLinker — testes unitários\n');

test('linka a primeira ocorrência de um termo simples', () => {
  const out = link('<p>A Sombra aparece nos sonhos.</p>');
  assert.match(out, /<a href="\/RaposaAnalitica\/verbetes\/sombra\/" class="term-link"[^>]*>Sombra<\/a>/);
});

test('preserva o case original do texto casado (Anima vs anima)', () => {
  const out1 = link('<p>Anima é um arquétipo.</p>');
  const out2 = link('<p>Falamos de anima aqui.</p>');
  assert.match(out1, />Anima<\/a>/);
  assert.match(out2, />anima<\/a>/);
});

test('lida com acentuação e boundary Unicode (individuação, numinoso)', () => {
  const out = link('<p>A individuação não é individualismo.</p>');
  assert.match(out, /<a[^>]*data-term-slug="individuacao"[^>]*>individuação<\/a>/);
  // "individualismo" não pode virar link
  assert.doesNotMatch(out.replace(/<a[^>]*>individuação<\/a>/, 'individuação'), /individualismo<\/a>/);
});

test('"persona" não casa dentro de "personalidade"', () => {
  const out = link('<p>Isso é traço de personalidade, não de Persona.</p>');
  const count = (out.match(/class="term-link"/g) || []).length;
  assert.equal(count, 1, `esperava 1 link, achou ${count}: ${out}`);
  assert.match(out, /personalidade,/); // "personalidade" não virou parte de link
  assert.match(out, /<a[^>]*>Persona<\/a>/);
});

test('"ego" não casa dentro de "egoísmo" nem "Diego"', () => {
  const out = link('<p>O egoísmo de Diego não é sobre o Ego.</p>');
  const count = (out.match(/class="term-link"/g) || []).length;
  assert.equal(count, 1, `esperava 1 link, achou ${count}: ${out}`);
  assert.match(out, /egoísmo/);
  assert.match(out, /Diego/);
  assert.match(out, /<a[^>]*>Ego<\/a>/);
});

test('termo composto casa antes do termo simples ("inconsciente coletivo")', () => {
  const out = link('<p>O inconsciente coletivo organiza tudo.</p>');
  assert.match(out, /<a[^>]*data-term-slug="inconsciente-coletivo"[^>]*>inconsciente coletivo<\/a>/);
});

test('alias com espaço ("si mesmo") aponta pro slug correto (self)', () => {
  const out = link('<p>Encontrar o si mesmo é a tarefa.</p>');
  assert.match(out, /<a[^>]*data-term-slug="self"[^>]*>si mesmo<\/a>/);
});

test('só a primeira ocorrência de cada termo por post — repetições não linkam', () => {
  const out = link('<p>Sombra, sombra, sempre a Sombra outra vez.</p>');
  const count = (out.match(/class="term-link"/g) || []).length;
  assert.equal(count, 1, `esperava 1 link só (primeira ocorrência), achou ${count}`);
});

test('múltiplos termos diferentes no mesmo parágrafo linkam todos (cada um 1x)', () => {
  const out = link('<p>Ego, Persona e Sombra formam um trio clínico.</p>');
  const count = (out.match(/class="term-link"/g) || []).length;
  assert.equal(count, 3, `esperava 3 links, achou ${count}: ${out}`);
});

test('nunca linka dentro de <a> existente', () => {
  const out = link('<p>Veja <a href="/outro">a Sombra explicada</a> em outro lugar.</p>');
  assert.doesNotMatch(out, /class="term-link"/);
});

test('nunca linka dentro de heading (h1-h6)', () => {
  const out = link('<h2>O que é Sombra?</h2><p>Sombra aparece aqui no corpo.</p>');
  const count = (out.match(/class="term-link"/g) || []).length;
  assert.equal(count, 1, 'só deveria linkar a ocorrência do <p>, não do <h2>');
  assert.doesNotMatch(out.split('</h2>')[0], /class="term-link"/);
});

test('nunca linka dentro de <code>/<pre>', () => {
  const out = link('<p>Isso é <code>Sombra</code> em código, e Sombra normal aqui.</p>');
  assert.doesNotMatch(out.split('</code>')[0], /class="term-link"/);
  assert.match(out, /class="term-link"/); // a ocorrência fora do <code> deve linkar
});

test('nunca linka dentro de <blockquote> (citação)', () => {
  const out = link('<blockquote>A Sombra é tudo que rejeitamos — Jung.</blockquote><p>Sombra aqui é normal.</p>');
  assert.doesNotMatch(out.split('</blockquote>')[0], /class="term-link"/);
  assert.match(out.split('</blockquote>')[1], /class="term-link"/);
});

test('HTML dentro de atributo nunca é tocado (alt, href, title, src)', () => {
  const html = '<p><img src="/img/sombra.png" alt="Retrato da Sombra" title="Sombra em pintura"> Texto sobre Sombra aqui.</p>';
  const out = link(html);
  // a imagem original deve continuar intacta, sem <a> injetado dentro dela
  assert.match(out, /<img src="\/img\/sombra\.png" alt="Retrato da Sombra" title="Sombra em pintura">/);
  // só deve haver 1 link (o do texto fora da tag <img>)
  const count = (out.match(/class="term-link"/g) || []).length;
  assert.equal(count, 1, `esperava 1 link fora do atributo, achou ${count}: ${out}`);
});

test('não corrompe a contagem de parágrafos nem gera tags quebradas', () => {
  const html = '<p>Um.</p><p>Sombra e Persona no mesmo texto.</p><p>Três.</p>';
  const out = link(html);
  const pBefore = (html.match(/<p>/g) || []).length;
  const pAfter = (out.match(/<p>/g) || []).length;
  assert.equal(pBefore, pAfter, 'contagem de <p> deve ser idêntica antes/depois');
  // não pode haver <a> aninhado dentro de <a> (nunca-dentro-de-outro-link-nosso)
  assert.doesNotMatch(out, /<a[^>]*>[^<]*<a /);
});

test('exclui o próprio termo do post via heurística de título', () => {
  const out = linkGlossaryTerms('<p>Falamos de Sombra neste ensaio.</p>', GLOSSARIO, {
    basePath: '/RaposaAnalitica',
    title: 'O que é a Sombra em Jung?',
  }).html;
  assert.doesNotMatch(out, /class="term-link"/, 'não deveria autolinkar Sombra no ensaio sobre Sombra');
});

test('scanGlossaryMentions detecta termos sem modificar o HTML e sem exclusão de auto-termo', () => {
  const entries = buildGlossaryEntries(GLOSSARIO);
  const html = '<h2>Sombra</h2><p>A Sombra e a Persona aparecem juntas.</p>';
  const mentions = scanGlossaryMentions(html, entries);
  // heading não conta (é tag protegida), mas o <p> sim
  assert.deepEqual(mentions.sort(), ['persona', 'sombra'].sort());
});

test('termo ausente do post não aparece nas menções', () => {
  const entries = buildGlossaryEntries(GLOSSARIO);
  const mentions = scanGlossaryMentions('<p>Nada relacionado aqui.</p>', entries);
  assert.deepEqual(mentions, []);
});

test('linkedSlugs retornado bate com os links de fato inseridos', () => {
  const { html, linkedSlugs } = linkGlossaryTerms('<p>Ego e Persona.</p>', GLOSSARIO, { basePath: '' });
  assert.deepEqual(linkedSlugs.sort(), ['ego', 'persona'].sort());
  assert.equal((html.match(/class="term-link"/g) || []).length, linkedSlugs.length);
});

test('formato normalizado do sitedata.js (getGlossario/getGlossarioCategories) autolinka igual', () => {
  // BlogPostView.jsx e glossario/[slug]/page.js passaram a ler via
  // getGlossario(true)/getGlossarioCategories(true) (src/lib/sitedata.js) em
  // vez de importar src/data/glossario.js direto — porque o painel de admin
  // (GlossarioManager) edita o glossário e getGlossario() é quem reflete
  // isso. normalizeGlossario() sempre entrega slug/term/aliases/short/hidden
  // (mais campos que o linker ignora); este caso simula essa forma e
  // confirma que `hidden: true` continua fora do autolink.
  const normalized = [
    { slug: 'ego', term: 'Ego', aliases: ['eu'], category: 'estrutura', short: 'Centro da consciência.', full: '', related: { terms: [], materials: [] }, links: [], hidden: false, ordem: 0 },
    { slug: 'sombra', term: 'Sombra', aliases: [], category: 'estrutura', short: 'O lado rejeitado.', full: '', related: { terms: [], materials: [] }, links: [], hidden: true, ordem: 1 },
  ];
  const out = linkGlossaryTerms('<p>Ego e Sombra no mesmo parágrafo.</p>', normalized, { basePath: '/RaposaAnalitica' }).html;
  assert.match(out, /<a[^>]*data-term-slug="ego"[^>]*>Ego<\/a>/);
  assert.doesNotMatch(out, /data-term-slug="sombra"/, 'verbete hidden:true (editado no painel) não deve autolinkar');
});

test('âncora estática do termo continua um <a href> real, sem target/rel de nova aba', () => {
  // O card do verbete (TermPreview.jsx) intercepta o clique via JS pra
  // abrir o preview em vez de navegar, e o link "ver verbete completo" de
  // dentro do card é quem abre em nova aba (target="_blank"). Mas o <a>
  // gerado aqui no HTML estático tem que continuar sendo o link real pro
  // silo (SEO + funciona sem JS) — nunca virar target="_blank" nem span.
  const out = link('<p>A Sombra aparece nos sonhos.</p>');
  assert.match(out, /<a href="\/RaposaAnalitica\/verbetes\/sombra\/" class="term-link" data-term-slug="sombra" data-term-title="Sombra" data-term-short="[^"]*">Sombra<\/a>/);
  assert.doesNotMatch(out, /target="_blank"/);
  assert.doesNotMatch(out, /<span[^>]*>Sombra<\/span>/);
});

test('palavra funcional ("eu", alias de Ego) NÃO vira link automático', () => {
  // "eu" é alias de Ego no glossário real. Autolinkar toda ocorrência de "eu"
  // mandava o leitor para o verbete Ego numa frase que não tem relação
  // nenhuma com o conceito (bug real, 30/07/2026).
  const out = link('<p>Como eu disse antes, isso é assim.</p>');
  assert.doesNotMatch(out, /term-link/, 'não deveria linkar nada aqui');
  assert.match(out, /Como eu disse antes/);
});

test('o termo canônico curto (Ego) continua sendo autolinkado', () => {
  // a lista de palavras funcionais não pode derrubar o próprio termo
  const out = link('<p>O Ego é o centro da consciência.</p>');
  assert.match(out, /<a[^>]*data-term-slug="ego"[^>]*>Ego<\/a>/);
});

test('marcação manual <span data-termo> vira link do verbete', () => {
  const out = link('<p>Aquele <span data-termo="complexo">núcleo afetivo</span> apareceu.</p>');
  assert.match(out, /<a[^>]*data-term-slug="complexo"[^>]*>núcleo afetivo<\/a>/);
  // título e definição vêm do glossário ATUAL, não congelados no post
  assert.match(out, /data-term-title="Complexo"/);
});

test('marcação manual para verbete inexistente vira texto puro, sem link quebrado', () => {
  const out = link('<p>Um <span data-termo="nao-existe">trecho</span> qualquer.</p>');
  assert.doesNotMatch(out, /term-link/);
  assert.doesNotMatch(out, /data-termo/);
  assert.match(out, /<p>Um trecho qualquer\.<\/p>/);
});

test('marcação manual tem prioridade e impede autolink do mesmo verbete depois', () => {
  const out = link('<p>Aquele <span data-termo="sombra">lado rejeitado</span> aparece. A Sombra insiste.</p>');
  const count = (out.match(/data-term-slug="sombra"/g) || []).length;
  assert.equal(count, 1, `verbete marcado à mão não deve ser autolinkado de novo: ${out}`);
  assert.match(out, />lado rejeitado<\/a>/, 'o link tem que ser o trecho que o autor marcou');
});

test('verbete com autolink: false não é autolinkado', () => {
  const glossario = [
    ...GLOSSARIO,
    { slug: 'eu-ego', term: 'Eu', aliases: [], short: 'Alias perigoso de teste.', autolink: false },
  ];
  const out = linkGlossaryTerms('<p>Eu cheguei cedo hoje.</p>', glossario, { basePath: '/RaposaAnalitica' }).html;
  assert.doesNotMatch(out, /term-link/, 'verbete com autolink:false não deveria virar link automático');
});

test('verbete com autolink: false continua funcionando por marcação manual', () => {
  const glossario = [
    ...GLOSSARIO,
    { slug: 'eu-ego', term: 'Eu', aliases: [], short: 'Alias perigoso de teste.', autolink: false },
  ];
  const out = linkGlossaryTerms('<p>Aquele <span data-termo="eu-ego">Eu</span> ali é o Ego mesmo.</p>', glossario, {
    basePath: '/RaposaAnalitica',
  }).html;
  assert.match(out, /<a[^>]*data-term-slug="eu-ego"[^>]*>Eu<\/a>/, 'marcação manual deve valer mesmo com autolink desligado');
});

test('verbete sem o campo `autolink` (conteúdo antigo) se comporta como ligado', () => {
  // simula um registro salvo antes de a flag existir — sem `autolink` no objeto
  const glossario = [{ slug: 'complexo', term: 'Complexo', aliases: [], short: 'Núcleo afetivo autônomo.' }];
  const out = linkGlossaryTerms('<p>O Complexo apareceu de novo.</p>', glossario, { basePath: '/RaposaAnalitica' }).html;
  assert.match(out, /<a[^>]*data-term-slug="complexo"[^>]*>Complexo<\/a>/, 'ausência do campo autolink deve equivaler a ligado');
});

console.log(`\n${passed} passaram, ${failed} falharam.`);
if (failed > 0) process.exit(1);

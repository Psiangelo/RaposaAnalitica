// Verbetes refeitos a pedido do Gabriel (01/10/2026): só os conceitos da
// lista do Vault Teoria («Pendência — o universo das teses de conceito»)
// que já têm material próprio no vault (tese, nota-conceito ou verbete do
// corpus): 110 conceitos, cada um com 2 ou 3 parágrafos simples escritos a
// partir desse material. Os 42 sem material entram quando a tese existir.
// Os 25 verbetes herdados do Psiangelo saem. Rodou uma vez; depois disso
// vale o painel.
//
//   node scripts/_verbetes-do-vault-2026-10-01.mjs <pasta com lote_XX.json> <conceitos.json>
import fs from 'node:fs';
import path from 'node:path';

const [pastaTextos, arquivoConceitos] = process.argv.slice(2);
const FILE = 'src/data/site-content.json';

const CATEGORIAS = [
  ['psique', 'Psique e topologia', 'ai'],
  ['figuras', 'Figuras e constelações', 'fuji'],
  ['tipologia', 'Tipologia', 'shiro'],
  ['dinamica', 'Dinâmica psíquica', 'aka'],
  ['mecanismos', 'Mecanismos do complexo', 'kuro'],
  ['processo', 'Processo e transformação', 'kin'],
  ['imagem', 'Imagem, símbolo e tempo', 'sakura'],
  ['religiao', 'Religião', 'koke'],
  ['alquimia', 'Alquimia', 'kuro'],
  ['metodo', 'Método', 'shiro'],
];
const TONS = ['accent', 'citrinit', 'bright', 'rubedo'];

// a máscara própria de alguns verbetes (o resto usa a da categoria)
const MASCARA = {
  persona: 'shiro', sombra: 'kuro', anima: 'fuji', animus: 'fuji', 'si-mesmo': 'kin', instinto: 'koke',
  inconsciente: 'ai', 'inconsciente-coletivo': 'ai', afeto: 'aka', emocao: 'aka', sonho: 'fuji', mandala: 'kin',
};

// palavras de todo dia: o verbete existe, mas não vira link sozinho no ensaio
const SEM_AUTOLINK = new Set(`tempo natureza amor morte corpo imagem vontade destino conflito adaptacao identidade
unidade transformacao diferenciacao integracao materia paradoxo caos sacrificio personalidade atitude emocao
pensamento sentimento sensacao intuicao assimilacao autonomia renascimento alma espirito`.split(/\s+/));

// apelidos ambíguos que saem (ligariam palavras comuns ao verbete errado)
const APELIDO_FORA = { deus: ['Deus'], opostos: ['oposição'], instinto: ['impulso'], persona: ['máscara'], psique: ['alma'] };

const conceitos = JSON.parse(fs.readFileSync(arquivoConceitos, 'utf8')); // [slug, termo, categoria, apelidos]
const textos = {};
for (const f of fs.readdirSync(pastaTextos).filter((n) => /^lote_\d+\.json$/.test(n)).sort()) {
  Object.assign(textos, JSON.parse(fs.readFileSync(path.join(pastaTextos, f), 'utf8')));
}

const slugs = new Set(conceitos.map((c) => c[0]));
const problemas = [];
for (const [slug] of conceitos) if (!textos[slug]) problemas.push(`sem texto: ${slug}`);
for (const slug of Object.keys(textos)) if (!slugs.has(slug)) problemas.push(`texto sobrando: ${slug}`);
for (const [slug, t] of Object.entries(textos)) {
  const tudo = `${t.short}\n${t.full}`;
  if (/[—–]/.test(tudo)) problemas.push(`travessão em ${slug}`);
  if (/[«»]/.test(tudo)) problemas.push(`aspas angulares em ${slug}`);
  if (/\bC[GORT]\d{3,}|\bAT\d{4,}|\(oc\d|\bCW\d/.test(tudo)) problemas.push(`código do vault em ${slug}`);
  if (/intelig[êe]ncia artificial|\bIA\b/.test(tudo)) problemas.push(`IA em ${slug}`);
  const n = t.full.split(/\n\n/).length;
  if (n < 2 || n > 3) problemas.push(`${slug}: ${n} parágrafos`);
}
if (problemas.length) {
  console.error(problemas.join('\n'));
  process.exit(1);
}

const ordemCat = Object.fromEntries(CATEGORIAS.map(([s], i) => [s, i]));
const glossario = conceitos.map(([slug, termo, cat, apelidos], i) => {
  const t = textos[slug];
  const fora = new Set(APELIDO_FORA[slug] || []);
  const verbete = {
    slug,
    term: termo,
    aliases: (apelidos || []).filter((a) => !fora.has(a)),
    category: cat,
    mascara: MASCARA[slug] || '',
    short: t.short,
    full: t.full,
    related: { terms: (t.related || []).filter((r) => slugs.has(r) && r !== slug), materials: [] },
    links: [],
    hidden: false,
    ordem: i,
  };
  if (SEM_AUTOLINK.has(slug)) verbete.autolink = false;
  return verbete;
}).sort((a, b) => ordemCat[a.category] - ordemCat[b.category] || a.ordem - b.ordem)
  .map((g, i) => ({ ...g, ordem: i }));

const usadas = new Set(glossario.map((g) => g.category));
const categorias = CATEGORIAS.filter(([s]) => usadas.has(s)).map(([slug, label, mascara], i) => ({
  slug, label, tone: TONS[i % TONS.length], mascara, ordem: i,
}));

const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const antigos = (snap.data.raposa_admin_glossario || []).map((g) => g.slug);
snap.data.raposa_admin_glossario = glossario;
snap.data.raposa_admin_glossario_categories = categorias;
fs.writeFileSync(FILE, JSON.stringify(snap, null, 2) + '\n');

const sairam = antigos.filter((s) => !slugs.has(s));
console.log(`${glossario.length} verbetes em ${categorias.length} categorias; ${glossario.filter((g) => g.autolink === false).length} sem link automático`);
console.log(`saíram ${sairam.length} dos antigos: ${sairam.join(', ')}`);

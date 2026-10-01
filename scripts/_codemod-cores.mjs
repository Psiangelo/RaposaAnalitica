// Troca de pele do Psiangelo (escuro, ouro) para a Raposa Analítica (papel, mata).
// Roda uma vez. Cada cor escrita à mão vira o PAPEL que ela cumpre
// (fundo, texto, acento...), definido em globals.css como variável.
// Uso: node scripts/_codemod-cores.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = path.resolve('src');

// hex do Psiangelo -> papel
const HEX_ROLE = {
  '0E0C0A': 'fundo', '131110': 'fundo-2', '1C1410': 'fundo-2',
  '1A1714': 'cartao', '221F19': 'cartao-hover', '221E1A': 'cartao-hover', '2A2520': 'linha',
  '3A352E': 'texto-sutil',
  'E8DDD0': 'texto-forte', 'EDDFC2': 'texto-forte',
  'B8AD9E': 'texto', '8C8378': 'texto-dim', '6E6458': 'texto-dim',
  'B48C50': 'acento', '9A7A48': 'acento-forte', '6E5530': 'acento-forte', '7A5E3A': 'acento-forte',
  'D4A853': 'acento-vivo', '8B3A2E': 'rubedo',
};
// valor literal da Raposa para cada papel (usado onde a cor precisa continuar
// sendo um hex de verdade: variáveis JS, concatenação de alfa, SVG gerado)
const ROLE_HEX = {
  'fundo': 'F2EBDC', 'fundo-2': 'EBE2CD', 'cartao': 'F8F4EA', 'cartao-hover': 'FCFAF4',
  'linha': 'D9CEB6', 'texto-sutil': '8A968F', 'texto-forte': '13211F', 'texto': '2C3A35',
  'texto-dim': '56655D', 'acento': '2E5240', 'acento-forte': '1E3A2F', 'acento-vivo': '962B24',
  'rubedo': '962B24',
};
// hex literais trocados por outro hex (dados, áreas)
const HEX_LITERAL = { '8B7355': '9A7552', '5A3E2E': '7A4A2E' };

// famílias rgb -> papel
const RGB_ROLE = {
  '180,140,80': 'acento', '193,158,90': 'acento', '160,120,60': 'acento', '122,94,58': 'acento',
  '110,85,48': 'acento', '63,47,24': 'acento',
  '14,12,10': 'fundo', '19,17,16': 'fundo', '28,23,18': 'fundo', '40,28,14': 'fundo',
  '212,168,83': 'ouro', '212,175,55': 'ouro',
  '139,58,46': 'rubedo',
  '232,221,208': 'texto-forte', '237,223,194': 'texto-forte',
  '110,100,88': 'texto-dim', '140,131,120': 'texto-dim',
  '20,12,4': 'sombra', '70,40,20': 'sombra',
};

const stats = {};
const bump = (k) => (stats[k] = (stats[k] || 0) + 1);

function alphaFromMod(mod) {
  if (!mod) return null;
  const m = mod.match(/^\/(\d+)$/);
  if (m) return String(Number(m[1]) / 100);
  const b = mod.match(/^\/\[([\d.]+)\]$/);
  if (b) return b[1];
  return null;
}

function transform(src, isCss) {
  let out = src;

  // A. classes Tailwind com hex arbitrário: text-[#B48C50]/40
  out = out.replace(/\[#([0-9A-Fa-f]{6})\](\/\d+|\/\[[\d.]+\])?/g, (m, hex, mod) => {
    const role = HEX_ROLE[hex.toUpperCase()];
    if (!role) return m;
    bump('classe:' + hex.toUpperCase());
    const a = alphaFromMod(mod);
    return a ? `[rgb(var(--${role}-rgb)/${a})]` : `[rgb(var(--${role}-rgb))]`;
  });

  // B. rgba(r,g,b,a) em qualquer lugar
  out = out.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g, (m, r, g, b, a) => {
    const role = RGB_ROLE[`${r},${g},${b}`];
    if (!role) return m;
    bump('rgba:' + `${r},${g},${b}`);
    return `rgb(var(--${role}-rgb)/${a})`;
  });

  // C. hex soltos
  out = out.replace(/#([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?\b/g, (m, hex, alpha) => {
    const H = hex.toUpperCase();
    if (HEX_LITERAL[H]) { bump('lit:' + H); return '#' + HEX_LITERAL[H] + (alpha || ''); }
    const role = HEX_ROLE[H];
    if (!role) return m;
    bump('hex:' + H);
    if (isCss && !alpha) return `var(--${role})`;
    return '#' + ROLE_HEX[role] + (alpha || '');
  });
  return out;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx?|css|mjs)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

let changed = 0;
for (const f of walk(ROOT)) {
  const src = fs.readFileSync(f, 'utf8');
  const out = transform(src, f.endsWith('.css'));
  if (out !== src) {
    changed++;
    if (!DRY) fs.writeFileSync(f, out);
  }
}
const tot = Object.values(stats).reduce((a, b) => a + b, 0);
console.log(`${DRY ? '[dry] ' : ''}${changed} arquivos, ${tot} trocas`);
for (const [k, v] of Object.entries(stats).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(5), k);

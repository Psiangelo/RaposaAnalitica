#!/usr/bin/env node
/**
 * gen-og-posts — a imagem de compartilhamento de cada ensaio (WhatsApp,
 * redes), no desenho da Raposa: papel washi, a padronagem da tag, o título
 * em Fraunces com o pivô em vermelho e a capa numa moldura inclinada.
 *
 * Saída: public/og/posts/<slug>.jpg (1200×630) e public/og/posts-v/<slug>.jpg
 * (720×1280, a vertical que o WhatsApp prefere no celular).
 *
 * Roda no prebuild (no GitHub Actions também). O resvg não lê WebP: para
 * capa em .webp, usa a irmã .jpg se existir (scripts/capas_raposa.py gera).
 * Nunca quebra o build: se um ensaio falhar, loga e segue.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import jpeg from 'jpeg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pub = resolve(root, 'public');
const out = resolve(pub, 'og', 'posts');
const outV = resolve(pub, 'og', 'posts-v');

const C = {
  washi: '#F2EBDC', tinta: '#13211F', mata: '#1E3A2F', cedro: '#2E5240', urushi: '#962B24',
  torii: '#CF432F', dim: '#56655D', papel: '#E6D6B4',
};
const CORES_TAG = ['#2E5240', '#962B24', '#2E4C7A', '#6B4A35', '#5C7D4E', '#9C3D5C', '#7A4A2E', '#1E3A2F'];

const FONTES = {
  fontFiles: [resolve(__dirname, 'fontes', 'Fraunces-var.ttf'), resolve(__dirname, 'fontes', 'Fraunces-Italic-var.ttf')],
  loadSystemFonts: false,
  defaultFontFamily: 'Fraunces',
};

function corDaTag(tag, mapa = {}) {
  const k = String(tag || '').toLowerCase();
  if (mapa[k]?.cor) return mapa[k].cor;
  let h = 0;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CORES_TAG[h % CORES_TAG.length];
}

function dataUri(file) {
  if (!existsSync(file)) return null;
  const ext = extname(file).toLowerCase().slice(1);
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
}

function imagem(src) {
  if (!src) return null;
  if (src.startsWith('data:image/webp')) return null;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('http')) return null;
  const limpo = src.replace(/^\/[^/]+\/(images|uploads)\//, '/$1/').replace(/^\//, '');
  const arq = resolve(pub, limpo);
  if (arq.endsWith('.webp')) return dataUri(arq.replace(/\.webp$/, '.jpg'));
  return dataUri(arq);
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Quebra o título (com *pivô*) em linhas de palavras marcadas. */
function linhas(titulo, maxChars, maxLinhas) {
  const palavras = [];
  let fimComEspaco = true;
  String(titulo || '').split(/(\*[^*]+\*)/).forEach((parte) => {
    if (!parte) return;
    const destaque = /^\*.*\*$/.test(parte);
    const texto = parte.replace(/\*/g, '');
    // pontuação colada à parte anterior («CIÊNCIA*!» não vira «CIÊNCIA !»)
    const colaNoInicio = !/^\s/.test(texto) && palavras.length > 0 && !fimComEspaco;
    fimComEspaco = /\s$/.test(texto);
    texto.split(/\s+/).filter(Boolean).forEach((w, i) => palavras.push({ w, destaque, cola: i === 0 && colaNoInicio }));
  });
  const out = [];
  let cur = [];
  let len = 0;
  for (const p of palavras) {
    if (len + p.w.length + (cur.length ? 1 : 0) > maxChars && cur.length) {
      out.push(cur);
      cur = [];
      len = 0;
      if (out.length === maxLinhas) break;
    }
    cur.push(p);
    len += p.w.length + (cur.length > 1 ? 1 : 0);
  }
  if (cur.length && out.length < maxLinhas) out.push(cur);
  return out;
}

function tituloSvg(ls, x, y, tam, alt) {
  return ls
    .map((l, i) => {
      const spans = l
        .map((p, j) => `<tspan${p.destaque ? ` font-style="italic" fill="${C.urushi}"` : ''}>${esc(p.w)}${j < l.length - 1 && !l[j + 1].cola ? ' ' : ''}</tspan>`)
        .join('');
      return `<text x="${x}" y="${y + i * alt}" font-family="Fraunces" font-size="${tam}" fill="${C.tinta}">${spans}</text>`;
    })
    .join('');
}

function padrao(cor) {
  // seigaiha em linha fina, tom sobre tom
  const s = 40;
  const arcos = [[0, s], [s, s], [s / 2, s / 2]]
    .flatMap(([cx, cy]) => [s * 0.5, s * 0.36, s * 0.22].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${cor}" stroke-width="1.4"/>`))
    .join('');
  return `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><g opacity="0.09">${arcos}</g></pattern>`;
}

function selo(x, y, tam) {
  return `<g transform="translate(${x},${y}) rotate(-4)"><rect width="${tam}" height="${tam}" rx="${tam * 0.09}" fill="${C.torii}"/><text x="${tam / 2}" y="${tam * 0.45}" text-anchor="middle" font-family="Fraunces" font-size="${tam * 0.15}" fill="${C.washi}">RAPOSA</text><text x="${tam / 2}" y="${tam * 0.68}" text-anchor="middle" font-family="Fraunces" font-size="${tam * 0.135}" fill="${C.washi}">ANALÍTICA</text></g>`;
}

function horizontal({ titulo, tag, cor, capa }) {
  const W = 1200;
  const H = 630;
  const ls = linhas(titulo, 22, 3);
  const tam = ls.length >= 3 ? 64 : 74;
  const alt = tam * 1.08;
  const y0 = 250 - ((ls.length - 1) * alt) / 2 + 20;
  const tagW = String(tag).length * 13 + 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>${padrao(cor)}<clipPath id="c"><rect x="790" y="70" width="350" height="440" rx="28"/></clipPath></defs>
  <rect width="${W}" height="${H}" fill="${C.washi}"/>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  <rect x="772" y="54" width="386" height="476" rx="34" fill="${cor}" transform="rotate(2.5 965 292)"/>
  ${capa ? `<image href="${capa}" x="790" y="70" width="350" height="440" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/>` : `<rect x="790" y="70" width="350" height="440" rx="28" fill="${C.mata}"/>`}
  <rect x="70" y="78" width="${tagW}" height="38" rx="19" fill="${cor}"/>
  <text x="${70 + tagW / 2}" y="104" text-anchor="middle" font-family="Fraunces" font-size="19" fill="${C.washi}" letter-spacing="2">${esc(String(tag).toUpperCase())}</text>
  ${tituloSvg(ls, 70, y0 + 80, tam, alt)}
  ${selo(70, 500, 74)}
  <text x="170" y="548" font-family="Fraunces" font-size="30" fill="${C.mata}">Raposa <tspan font-style="italic" fill="${C.urushi}">Analítica</tspan></text>
</svg>`;
}

function vertical({ titulo, tag, cor, capa }) {
  const W = 720;
  const H = 1280;
  const ls = linhas(titulo, 15, 4);
  const tam = ls.length >= 4 ? 70 : 80;
  const alt = tam * 1.08;
  const tagW = String(tag).length * 15 + 46;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>${padrao(cor)}<clipPath id="c"><rect x="70" y="70" width="580" height="640" rx="36"/></clipPath></defs>
  <rect width="${W}" height="${H}" fill="${C.washi}"/>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  <rect x="52" y="52" width="616" height="676" rx="42" fill="${cor}" transform="rotate(2.5 360 390)"/>
  ${capa ? `<image href="${capa}" x="70" y="70" width="580" height="640" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/>` : `<rect x="70" y="70" width="580" height="640" rx="36" fill="${C.mata}"/>`}
  <rect x="70" y="780" width="${tagW}" height="44" rx="22" fill="${cor}"/>
  <text x="${70 + tagW / 2}" y="810" text-anchor="middle" font-family="Fraunces" font-size="22" fill="${C.washi}" letter-spacing="2">${esc(String(tag).toUpperCase())}</text>
  ${tituloSvg(ls, 70, 900, tam, alt)}
  ${selo(70, 1150, 80)}
  <text x="178" y="1204" font-family="Fraunces" font-size="34" fill="${C.mata}">Raposa <tspan font-style="italic" fill="${C.urushi}">Analítica</tspan></text>
</svg>`;
}

function jpg(svg, largura) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: largura }, font: FONTES, background: C.washi }).render();
  return jpeg.encode({ data: r.pixels, width: r.width, height: r.height }, 82).data;
}

function main() {
  const arq = resolve(root, 'src', 'data', 'site-content.json');
  if (!existsSync(arq)) return;
  const data = JSON.parse(readFileSync(arq, 'utf8')).data || {};
  const posts = (data.raposa_admin_blog || []).filter((p) => (p.slug || p.id) && (!p.status || p.status === 'published'));
  const mapa = data.raposa_admin_tag_estilos || {};
  mkdirSync(out, { recursive: true });
  mkdirSync(outV, { recursive: true });
  let ok = 0;
  for (const p of posts) {
    const slug = p.slug || p.id;
    try {
      const tag = p.tags?.[0] || 'Ensaio';
      const base = { titulo: p.title || 'Sem título', tag, cor: corDaTag(tag, mapa) };
      const capaV = imagem(p.featured_cover) || imagem(p.featured_image);
      writeFileSync(resolve(out, `${slug}.jpg`), jpg(horizontal({ ...base, capa: capaV }), 1200));
      writeFileSync(resolve(outV, `${slug}.jpg`), jpg(vertical({ ...base, capa: capaV }), 720));
      ok++;
    } catch (e) {
      console.warn(`[og-posts] ✗ ${slug}: ${e.message}`);
    }
  }
  console.log(`[og-posts] ${ok} de ${posts.length} ensaios com imagem de compartilhamento`);
}

try {
  main();
} catch (e) {
  console.error('[og-posts] erro:', e.message);
}

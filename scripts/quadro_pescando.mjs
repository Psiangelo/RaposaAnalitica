/**
 * A raposa pescando, emoldurada para o site.
 *
 * O desenho do banco (raposa_agua_pescando_com_a_cauda.svg) foi feito para
 * sangrar na borda do slide: o quadro corta a cabeça da raposa no meio dos
 * olhos e o lago termina num retângulo seco. Aqui ele vira uma gravura de
 * cantos redondos: o quadro sobe até mostrar as orelhas, o céu ganha a lua e
 * duas faixas de névoa (kasumi), o lago ganha seigaiha tom sobre tom, e a
 * água e o koi saem pela borda do quadro, que é onde o corte faz sentido.
 *
 * Grava SVG e PNG no banco da identidade (figuras/banco); o WebP do site sai
 * pelo assets_raposa.py (fig/raposa-pescando-quadro).
 *
 *   node scripts/quadro_pescando.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const BANCO = 'C:/Users/gabri/OneDrive/Desktop/Raposa Analítica - identidade visual/figuras/banco';
const ORIGEM = path.join(BANCO, 'svg', 'raposa_agua_pescando_com_a_cauda.svg');
const NOME = 'raposa_agua_pescando_quadro';

// quadro em unidades do desenho original (a ponta das orelhas está em y = -81)
const X = 0, Y = -112, W = 620, H = 648, RAIO = 26;

const svg = fs.readFileSync(ORIGEM, 'utf8');
const caminhos = svg.match(/<path[^>]*\/>/g);
if (!caminhos || !/fill="#2E4C7A"/.test(caminhos[0])) throw new Error('o primeiro caminho devia ser a água');
const agua = caminhos[0];
const dAgua = agua.match(/ d="([^"]+)"/)[1];

const S = 42; // seigaiha, como em src/lib/wagara.js
const arcos = [];
for (const [cx, cy] of [[0, S], [S, S], [S / 2, S / 2]]) {
  for (const r of [S * 0.5, S * 0.36, S * 0.22]) {
    arcos.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5A7BAA" stroke-width="1.7"/>`);
  }
}

const quadro = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${X} ${Y} ${W} ${H}">
<defs>
<clipPath id="quadro"><rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="${RAIO}"/></clipPath>
<clipPath id="lago"><path d="${dAgua}"/></clipPath>
<pattern id="ondas" width="${S}" height="${S}" patternUnits="userSpaceOnUse">${arcos.join('')}</pattern>
</defs>
<g clip-path="url(#quadro)">
<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="#F2EBDC"/>
<circle cx="470" cy="18" r="98" fill="#E9C85E"/>
<rect x="286" y="88" width="420" height="24" rx="12" fill="#E6D6B4"/>
<rect x="232" y="132" width="250" height="18" rx="9" fill="#E6D6B4"/>
<rect x="452" y="-52" width="240" height="16" rx="8" fill="#E6D6B4"/>
${agua}
<rect x="-30" y="320" width="${W + 60}" height="260" fill="url(#ondas)" opacity="0.26" clip-path="url(#lago)"/>
${caminhos.slice(1).join('\n')}
</g>
</svg>
`;

fs.writeFileSync(path.join(BANCO, 'svg', `${NOME}.svg`), quadro);
const png = new Resvg(quadro, { fitTo: { mode: 'width', value: 1200 }, background: 'rgba(0,0,0,0)' }).render().asPng();
fs.writeFileSync(path.join(BANCO, 'png', `${NOME}.png`), png);
console.log(`${NOME}: svg + png (${png.length} bytes)`);

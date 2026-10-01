#!/usr/bin/env node
// Gera os PNGs de OG a partir dos SVGs em /public usando @resvg/resvg-js.
// Rodar depois de alterar os SVGs: `node scripts/gen-og-png.mjs`

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, '..', 'public');

const targets = [
  // WhatsApp preview: PNG 1200x1200 quadrado
  { svg: 'og-square.svg', png: 'og-square.png', width: 1200 },
  // Fallback: PNG 1200x630 retangular (Facebook/Twitter)
  { svg: 'og.svg',        png: 'og.png',        width: 1200 },
];

for (const t of targets) {
  const svg = readFileSync(resolve(pub, t.svg), 'utf-8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: t.width },
    font: {
      // Tenta usar fontes do sistema (Georgia, Times, Courier)
      loadSystemFonts: true,
      defaultFontFamily: 'Georgia',
      serifFamily: 'Georgia',
      sansSerifFamily: 'Arial',
      monospaceFamily: 'Courier New',
    },
    background: '#0E0C0A',
  });
  const pngData = resvg.render().asPng();
  writeFileSync(resolve(pub, t.png), pngData);
  console.log(`✓ ${t.png} (${pngData.length} bytes)`);
}

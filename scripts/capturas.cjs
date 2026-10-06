// Capturas de tela das páginas, em computador e celular, para conferir o
// desenho. Uso: node scripts/capturas.cjs <pasta-de-saida> [rota ...]
// Também acusa erro de console e rolagem horizontal (página mais larga que a tela).
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE = process.env.URL_BASE || 'http://localhost:4321';
const saida = process.argv[2] || 'capturas';
const rotas = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];

(async () => {
  fs.mkdirSync(saida, { recursive: true });
  const b = await chromium.launch();
  for (const [w, h, nome] of [[1366, 900, 'pc'], [390, 844, 'cel']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    for (const r of rotas) {
      const p = await ctx.newPage();
      const erros = [];
      p.on('pageerror', (e) => erros.push(String(e.message).slice(0, 160)));
      p.on('response', (res) => res.status() >= 400 && erros.push(res.status() + ' ' + res.url().replace(BASE, '')));
      await p.goto(BASE + r, { waitUntil: 'networkidle' }).catch((e) => erros.push('goto: ' + e.message));
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((res) => setTimeout(res, 160));
        }
        window.scrollTo(0, 0);
      });
      await p.waitForTimeout(1500);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      const arq = path.join(saida, `${nome}_${r.replace(/[\/#?=]+/g, '_') || 'home'}.png`);
      await p.screenshot({ path: arq, fullPage: true });
      console.log(`${nome} ${r} largura=${sw}${sw > w ? ' ⚠ ROLAGEM HORIZONTAL' : ''}${erros.length ? ' ERROS: ' + erros.join(' | ') : ''}`);
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
})();

// Serve a pasta out/ como o GitHub Pages serve (com o caminho base), para
// conferir o build estático no navegador. Uso: node scripts/servir-out.mjs [porta]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const PORTA = Number(process.argv[2] || 4321);
const OUT = path.resolve('out');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg',
};

http
  .createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (!url.startsWith(BASE)) {
      res.writeHead(302, { Location: BASE + '/' });
      return res.end();
    }
    url = url.slice(BASE.length) || '/';
    let f = path.join(OUT, url);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) f = path.join(OUT, '404.html');
    res.writeHead(f.endsWith('404.html') && !url.endsWith('404.html') ? 404 : 200, {
      'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream',
    });
    fs.createReadStream(f).pipe(res);
  })
  .listen(PORTA, () => console.log(`http://localhost:${PORTA}${BASE}/`));

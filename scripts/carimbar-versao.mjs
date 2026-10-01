// Carimba a versão do conteúdo publicado antes de cada build.
//
// O navegador de quem já visitou o site guarda o conteúdo no localStorage e
// só troca pelo do build quando a `version` do site-content.json é maior que
// a última aplicada (src/lib/contentBootstrap.js). O botão Publicar do painel
// sobe a versão sozinho; uma edição feita direto no arquivo, não. Sem este
// carimbo, quem já tinha entrado continuava vendo o conteúdo velho.
//
// Guarda em `data_hash` a impressão digital do conteúdo; se ela mudou, a
// versão vira a hora atual. Conteúdo igual, arquivo intocado.
import fs from 'node:fs';
import crypto from 'node:crypto';

const FILE = 'src/data/site-content.json';
const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const hash = crypto.createHash('sha1').update(JSON.stringify(snap.data || {})).digest('hex');

if (snap.data_hash === hash) {
  console.log('conteúdo sem mudança, versão', snap.version);
} else {
  const agora = Date.now();
  snap.version = Math.max(agora, (Number(snap.version) || 0) + 1);
  snap.published_at = new Date(snap.version).toISOString();
  snap.data_hash = hash;
  fs.writeFileSync(FILE, JSON.stringify(snap, null, 2) + '\n');
  console.log('conteúdo mudou: nova versão', snap.version);
}
